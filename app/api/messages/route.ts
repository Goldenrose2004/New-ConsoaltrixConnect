import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { findAdmin, getAdminId } from "@/lib/admin-helper"

// GET: Fetch messages for a conversation (between user and admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const adminId = searchParams.get("adminId") // Optional: specific admin ID
    const perspective = searchParams.get("perspective") || "user" // "user" or "admin"

    if (!userId) {
      return NextResponse.json({ ok: false, error: "User ID is required" }, { status: 400 })
    }

    let db
    try {
      const dbResult = await connectToDatabase()
      db = dbResult.db
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }

    let actualAdminId = adminId
    if (!actualAdminId || actualAdminId === "admin") {
      actualAdminId = await getAdminId(db)
    }

    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { senderId: userId, receiverId: actualAdminId },
          { senderId: actualAdminId, receiverId: userId },
          // Also handle "admin" string identifier for backward compatibility
          { senderId: userId, receiverId: "admin" },
          { senderId: "admin", receiverId: userId },
        ],
      })
      .sort({ createdAt: 1 }) // Sort by creation time ascending (oldest first)
      .toArray()

    const senderIds = [...new Set(messages.map(msg => msg.senderId))]
    const userProfiles: Record<string, { profilePicture?: string | null }> = {}
    
    const adminUser = await findAdmin(db)
    if (adminUser) {
      const adminId = adminUser._id.toString()
      userProfiles[adminId] = {
        profilePicture: adminUser.profilePicture || null,
      }
      // Also map "admin" string to admin profile picture
      userProfiles["admin"] = {
        profilePicture: adminUser.profilePicture || null,
      }
    }
    
    for (const senderId of senderIds) {
      if (senderId && senderId !== "admin") {
        try {
          let userQuery: any = {}
          if (ObjectId.isValid(senderId)) {
            userQuery._id = new ObjectId(senderId)
          } else {
            userQuery = {
              $or: [
                { email: senderId },
                { studentId: senderId },
              ],
            }
          }
          
          const user = await db.collection("users").findOne(userQuery, { 
            projection: { profilePicture: 1 } 
          })
          
          if (user) {
            userProfiles[senderId] = {
              profilePicture: user.profilePicture || null,
            }
            if (user.role === "admin") {
              userProfiles["admin"] = {
                profilePicture: user.profilePicture || null,
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching profile for sender ${senderId}:`, error)
        }
      }
    }

    // Transform messages to match ChatMessage type
    const formattedMessages = messages.map((msg) => {
      const isAdminMessage = msg.senderId === actualAdminId || msg.senderId === "admin"
      const isOutgoing = perspective === "admin" ? isAdminMessage : !isAdminMessage

      return {
        id: msg._id.toString(),
        senderId: msg.senderId,
        senderName: msg.senderName || "",
        senderInitials: msg.senderInitials || "",
        senderProfilePicture: userProfiles[msg.senderId]?.profilePicture || null,
        text: msg.text || "",
        timestamp: msg.createdAt
          ? new Date(msg.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }) +
            ", " +
            new Date(msg.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "",
        isOutgoing,
        read: msg.read || false,
        repliedTo: msg.repliedTo || null,
        reactions: msg.reactions || [],
        deleted: msg.deleted || false,
        deletedBy: msg.deletedBy || null,
        deletedByName: msg.deletedByName || null,
        attachments: msg.attachments || [],
      }
    })

    return NextResponse.json({ ok: true, messages: formattedMessages }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, senderName, senderInitials, text, repliedTo, attachments } = await request.json()

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { ok: false, error: "senderId and receiverId are required" },
        { status: 400 }
      )
    }

    // Message must have either text or attachments
    if ((!text || !text.trim()) && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { ok: false, error: "Message must have either text or attachments" },
        { status: 400 }
      )
    }

    let db
    try {
      const dbResult = await connectToDatabase()
      db = dbResult.db
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }

    // Verify that this is a user-to-admin conversation
    let sender: any = null
    let receiver: any = null

    if (senderId === "admin") {
      // Admin is sending - find any admin user
      sender = await findAdmin(db)
      if (!sender) {
        sender = { role: "admin", _id: "admin" }
      }
    } else {
      // Find sender by ID or email
      sender = await db.collection("users").findOne({
        $or: [
          { _id: ObjectId.isValid(senderId) ? new ObjectId(senderId) : null },
          { email: senderId },
          { studentId: senderId },
        ],
      })
    }

    if (receiverId === "admin") {
      // Admin is receiving - find any admin user
      receiver = await findAdmin(db)
      if (!receiver) {
        receiver = { role: "admin", _id: "admin" }
      }
    } else {
      // Find receiver by ID or email
      receiver = await db.collection("users").findOne({
        $or: [
          { _id: ObjectId.isValid(receiverId) ? new ObjectId(receiverId) : null },
          { email: receiverId },
          { studentId: receiverId },
        ],
      })
    }

    // Enforce user-to-admin only messaging
    const isSenderAdmin = senderId === "admin" || sender?.role === "admin"
    const isReceiverAdmin = receiverId === "admin" || receiver?.role === "admin"

    if (!isSenderAdmin) {
      if (!sender || sender.role === "admin") {
        return NextResponse.json({ ok: false, error: "Invalid sender" }, { status: 400 })
      }
      // User can only send to admin
      if (!isReceiverAdmin) {
        return NextResponse.json(
          { ok: false, error: "Users can only message admins" },
          { status: 403 }
        )
      }
    }

    if (isSenderAdmin && !isReceiverAdmin && !receiver) {
      return NextResponse.json({ ok: false, error: "Invalid receiver" }, { status: 400 })
    }

    // Normalize IDs - use actual admin ID if found, otherwise keep "admin" string
    const normalizedSenderId = isSenderAdmin && sender?._id && sender._id !== "admin" 
      ? sender._id.toString() 
      : (isSenderAdmin ? "admin" : senderId)
    
    const normalizedReceiverId = isReceiverAdmin && receiver?._id && receiver._id !== "admin"
      ? receiver._id.toString()
      : (isReceiverAdmin ? "admin" : receiverId)

    const message: any = {
      senderId: normalizedSenderId,
      receiverId: normalizedReceiverId,
      senderName: senderName || (sender?.firstName + " " + sender?.lastName) || "Unknown",
      senderInitials: senderInitials || (sender?.firstName?.[0] || "") + (sender?.lastName?.[0] || "") || "U",
      text: text ? text.trim() : "",
      createdAt: new Date(),
      read: false,
      reactions: [],
    }

    // Add repliedTo if provided
    if (repliedTo) {
      message.repliedTo = repliedTo
    }

    // Add attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      message.attachments = attachments.map((att: any) => ({
        fileName: att.fileName || "file",
        fileType: att.fileType || "application/octet-stream",
        fileSize: att.fileSize || 0,
        fileData: att.fileData, // base64 encoded
        mimeType: att.mimeType || att.fileType || "application/octet-stream",
      }))
    }

    const result = await db.collection("messages").insertOne(message)

    try {
      const receiverUserId = normalizedReceiverId
      const senderName = message.senderName || "Admin"
      
      if (receiverUserId !== normalizedSenderId) {
        await db.collection("notifications").insertOne({
          userId: receiverUserId,
          title: "New Message",
          description: `${senderName}: ${message.text.substring(0, 100)}${message.text.length > 100 ? "..." : ""}`,
          type: "message",
          createdAt: new Date(),
          read: false,
          readAt: null,
          relatedId: result.insertedId.toString(),
          badgeColor: "#10B981",
          conversationUserId: isReceiverAdmin ? String(normalizedSenderId) : null,
        })
      }

      if (repliedTo && ObjectId.isValid(repliedTo)) {
        try {
          const originalMessage = await db.collection("messages").findOne({
            _id: new ObjectId(repliedTo),
          })

          if (originalMessage) {
            // Normalize IDs for comparison (handle admin string vs ObjectId)
            let normalizedOriginalSenderId = String(originalMessage.senderId)
            let normalizedCurrentSenderId = String(normalizedSenderId)
            
            if (ObjectId.isValid(originalMessage.senderId)) {
              const originalSenderUser = await db.collection("users").findOne({ 
                _id: new ObjectId(originalMessage.senderId) 
              })
              if (originalSenderUser && originalSenderUser.role === "admin") {
                normalizedOriginalSenderId = originalSenderUser._id.toString()
              } else {
                const adminFromAdmins = await findAdmin(db, { _id: originalMessage.senderId })
                if (adminFromAdmins) {
                  normalizedOriginalSenderId = adminFromAdmins._id.toString()
                } else {
                  normalizedOriginalSenderId = originalMessage.senderId.toString()
                }
              }
            }
            
            if (normalizedSenderId === "admin" || normalizedSenderId === "Admin") {
              const adminUser = await findAdmin(db)
              if (adminUser) {
                normalizedCurrentSenderId = adminUser._id.toString()
              }
            } else if (ObjectId.isValid(normalizedSenderId)) {
              const currentSenderUser = await db.collection("users").findOne({ 
                _id: new ObjectId(normalizedSenderId) 
              })
              if (currentSenderUser && currentSenderUser.role === "admin") {
                normalizedCurrentSenderId = currentSenderUser._id.toString()
              } else {
                const adminFromAdmins = await findAdmin(db, { _id: normalizedSenderId })
                if (adminFromAdmins) {
                  normalizedCurrentSenderId = adminFromAdmins._id.toString()
                } else {
                  normalizedCurrentSenderId = normalizedSenderId.toString()
                }
              }
            }
            
            if (normalizedOriginalSenderId !== normalizedCurrentSenderId) {
              let senderDisplayName = senderName
              if (normalizedSenderId === "admin" || normalizedSenderId === "Admin") {
                senderDisplayName = "Admin"
              } else if (sender) {
                senderDisplayName = `${sender.firstName} ${sender.lastName}`
              }

              await db.collection("notifications").insertOne({
                userId: originalMessage.senderId,
                title: "Message Replied",
                description: `${senderDisplayName} replied to your message: ${message.text.substring(0, 80)}${message.text.length > 80 ? "..." : ""}`,
                type: "message",
                createdAt: new Date(),
                read: false,
                readAt: null,
                relatedId: result.insertedId.toString(),
                badgeColor: "#8B5CF6",
                conversationUserId: normalizedCurrentSenderId,
              })
            }
          }
        } catch (replyNotifError) {
          // Log error but don't fail the message creation
          console.error("Error creating notification for reply:", replyNotifError)
        }
      }
    } catch (notifError) {
      // Log error but don't fail the message creation
      console.error("Error creating notification for message:", notifError)
    }

    // Return the created message
    const createdMessage = {
      id: result.insertedId.toString(),
      senderId: message.senderId,
      senderName: message.senderName,
      senderInitials: message.senderInitials,
      text: message.text || "",
      timestamp:
        new Date(message.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) +
        ", " +
        new Date(message.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      isOutgoing: isSenderAdmin, // Will be adjusted by the caller based on perspective
      read: false,
      repliedTo: message.repliedTo || null,
      reactions: [],
      attachments: message.attachments || [],
    }

    return NextResponse.json({ ok: true, message: createdMessage }, { status: 201 })
  } catch (error: any) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to send message" },
      { status: 500 }
    )
  }
}

// PUT: Edit a message
export async function PUT(request: NextRequest) {
  try {
    const { messageId, text } = await request.json()

    if (!messageId || !text || !text.trim()) {
      return NextResponse.json(
        { ok: false, error: "messageId and text are required" },
        { status: 400 }
      )
    }

    let db
    try {
      const dbResult = await connectToDatabase()
      db = dbResult.db
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }

    // Validate ObjectId
    if (!ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid message ID" },
        { status: 400 }
      )
    }

    const originalMessage = await db.collection("messages").findOne({
      _id: new ObjectId(messageId),
    })

    if (!originalMessage) {
      return NextResponse.json(
        { ok: false, error: "Message not found" },
        { status: 404 }
      )
    }

    const result = await db.collection("messages").updateOne(
      { _id: new ObjectId(messageId) },
      {
        $set: {
          text: text.trim(),
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Message not found" },
        { status: 404 }
      )
    }

    const updatedMessage = await db.collection("messages").findOne({
      _id: new ObjectId(messageId),
    })

    if (!updatedMessage) {
      return NextResponse.json(
        { ok: false, error: "Failed to fetch updated message" },
        { status: 500 }
      )
    }

    try {
      const messageSenderId = originalMessage.senderId
      const messageReceiverId = originalMessage.receiverId
      
      // Normalize IDs for comparison (handle admin string vs ObjectId)
      let normalizedSenderId = String(messageSenderId)
      let normalizedReceiverId = String(messageReceiverId)
      
      // Normalize sender ID
      if (messageSenderId === "admin" || messageSenderId === "Admin") {
        const adminUser = await findAdmin(db)
        if (adminUser) {
          normalizedSenderId = adminUser._id.toString()
        }
      } else if (ObjectId.isValid(messageSenderId)) {
        const senderUser = await db.collection("users").findOne({ 
          _id: new ObjectId(messageSenderId) 
        })
        if (senderUser && senderUser.role === "admin") {
          normalizedSenderId = senderUser._id.toString()
        } else {
          const adminFromAdmins = await findAdmin(db, { _id: messageSenderId })
          if (adminFromAdmins) {
            normalizedSenderId = adminFromAdmins._id.toString()
          } else {
            normalizedSenderId = messageSenderId.toString()
          }
        }
      }
      
      // Normalize receiver ID
      if (messageReceiverId === "admin" || messageReceiverId === "Admin") {
        const adminUser = await findAdmin(db)
        if (adminUser) {
          normalizedReceiverId = adminUser._id.toString()
        }
      } else if (ObjectId.isValid(messageReceiverId)) {
        const receiverUser = await db.collection("users").findOne({ 
          _id: new ObjectId(messageReceiverId) 
        })
        if (receiverUser && receiverUser.role === "admin") {
          normalizedReceiverId = receiverUser._id.toString()
        } else {
          const adminFromAdmins = await findAdmin(db, { _id: messageReceiverId })
          if (adminFromAdmins) {
            normalizedReceiverId = adminFromAdmins._id.toString()
          } else {
            normalizedReceiverId = messageReceiverId.toString()
          }
        }
      }
      
      let editorName = "Someone"
      if (messageSenderId === "admin" || messageSenderId === "Admin") {
        editorName = "Admin"
      } else if (ObjectId.isValid(messageSenderId)) {
        const editor = await db.collection("users").findOne({
          _id: new ObjectId(messageSenderId),
        })
        if (editor) {
          editorName = `${editor.firstName} ${editor.lastName}`
        }
      }

      // Notify the receiver (the other person in the conversation) if they're different from sender
      if (messageReceiverId && normalizedReceiverId !== normalizedSenderId) {
        await db.collection("notifications").insertOne({
          userId: messageReceiverId,
          title: "Message Edited",
          description: `${editorName} edited their message: ${text.trim().substring(0, 80)}${text.trim().length > 80 ? "..." : ""}`,
          type: "message",
          createdAt: new Date(),
          read: false,
          readAt: null,
          relatedId: messageId,
          badgeColor: "#6366F1",
        })
      }
    } catch (notifError) {
      // Log error but don't fail the message edit
      console.error("Error creating notification for edited message:", notifError)
    }

    return NextResponse.json(
      {
        ok: true,
        message: {
          id: updatedMessage._id.toString(),
          text: updatedMessage.text,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error editing message:", error)
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to edit message" },
      { status: 500 }
    )
  }
}

// DELETE: Mark a message as deleted
export async function DELETE(request: NextRequest) {
  try {
    const { messageId, deletedBy, deletedByName } = await request.json()

    if (!messageId || !deletedBy) {
      return NextResponse.json(
        { ok: false, error: "messageId and deletedBy are required" },
        { status: 400 }
      )
    }

    let db
    try {
      const dbResult = await connectToDatabase()
      db = dbResult.db
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }

    // Validate ObjectId
    if (!ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid message ID" },
        { status: 400 }
      )
    }

    const message = await db.collection("messages").findOne({
      _id: new ObjectId(messageId),
    })

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message not found" },
        { status: 404 }
      )
    }

    const result = await db.collection("messages").updateOne(
      { _id: new ObjectId(messageId) },
      {
        $set: {
          deleted: true,
          deletedBy: deletedBy,
          deletedByName: deletedByName || "Unknown",
          deletedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Message not found" },
        { status: 404 }
      )
    }

    try {
      const messageSenderId = message.senderId
      const deleterName = deletedByName || "Someone"
      
      // Normalize IDs for comparison (handle admin string vs ObjectId)
      let normalizedSenderId = String(messageSenderId)
      let normalizedDeleterId = String(deletedBy)
      
      if (deletedBy === "admin" || deletedBy === "Admin") {
        const adminUser = await findAdmin(db)
        if (adminUser) {
          normalizedDeleterId = adminUser._id.toString()
        }
      }
      
      if (ObjectId.isValid(messageSenderId)) {
        const senderUser = await db.collection("users").findOne({ _id: new ObjectId(messageSenderId) })
        if (senderUser && senderUser.role === "admin") {
          normalizedSenderId = senderUser._id.toString()
        } else {
          const adminFromAdmins = await findAdmin(db, { _id: messageSenderId })
          if (adminFromAdmins) {
            normalizedSenderId = adminFromAdmins._id.toString()
          } else {
            normalizedSenderId = messageSenderId.toString()
          }
        }
      }
      
      if (normalizedSenderId !== normalizedDeleterId) {
        await db.collection("notifications").insertOne({
          userId: messageSenderId,
          title: "Message Deleted",
          description: `${deleterName} deleted your message: ${message.text.substring(0, 80)}${message.text.length > 80 ? "..." : ""}`,
          type: "message",
          createdAt: new Date(),
          read: false,
          readAt: null,
          relatedId: messageId,
          badgeColor: "#EF4444",
        })
      }
    } catch (notifError) {
      // Log error but don't fail the deletion
      console.error("Error creating notification for deleted message:", notifError)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting message:", error)
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to delete message" },
      { status: 500 }
    )
  }
}

// PATCH: Mark messages as read (when admin opens a conversation)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, adminId } = await request.json()

    if (!userId) {
      return NextResponse.json({ ok: false, error: "User ID is required" }, { status: 400 })
    }

    let db
    try {
      const dbResult = await connectToDatabase()
      db = dbResult.db
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }

    // Find actual admin ID if needed
    let actualAdminId = adminId || "admin"
    if (!actualAdminId || actualAdminId === "admin") {
      actualAdminId = await getAdminId(db)
    }

    const result = await db.collection("messages").updateMany(
      {
        $or: [
          { senderId: userId, receiverId: actualAdminId, read: false },
          { senderId: userId, receiverId: "admin", read: false },
        ],
      },
      {
        $set: { read: true },
      }
    )

    try {
      const updatedMessages = await db.collection("messages").find({
        $or: [
          { senderId: userId, receiverId: actualAdminId },
          { senderId: userId, receiverId: "admin" },
        ],
      }).toArray()

      const messageIds = updatedMessages.map((msg) => msg._id.toString())
      
      if (messageIds.length > 0) {
        await db.collection("notifications").updateMany(
          {
            userId: actualAdminId,
            type: "message",
            relatedId: { $in: messageIds },
            read: false,
          },
          {
            $set: {
              read: true,
              readAt: new Date(),
            },
          }
        )
      }
    } catch (notifError) {
      // Log error but don't fail the message read update
      console.error("Error marking notifications as read:", notifError)
    }

    return NextResponse.json(
      { ok: true, updatedCount: result.modifiedCount },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to mark messages as read" },
      { status: 500 }
    )
  }
}