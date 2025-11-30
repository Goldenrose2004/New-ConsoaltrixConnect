"use client"

import { CheckCircle2 } from "lucide-react"
import React from "react"

type SuccessDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}

export function SuccessDialog({ open, title, description, confirmLabel = "Continue", onConfirm }: SuccessDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{description}</p>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-xl bg-[#041A44] py-2.5 text-sm font-semibold text-white hover:bg-[#0b2c6f] transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

