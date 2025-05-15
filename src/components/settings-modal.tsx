"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Lock, Upload } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Use useRef to prevent creating multiple Supabase clients on re-renders
  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ).current

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setEmail(session.user.email || "")
        setAvatar(session.user.user_metadata?.avatar_url || null)
      }
    }
    if (open) {
      fetchUser()
    }
  }, [open, supabase])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview URL
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setSelectedFile(file)
  }

  const uploadAvatar = async () => {
    if (!selectedFile) return null

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("No user found")

      // Upload avatar to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("No user found")

      // Handle email change separately
      if (email !== session.user.email) {
        const { data, error: emailError } = await supabase.auth.updateUser({
          email: email
        })
        
        // Check if we got a response indicating email confirmation is needed
        if (emailError?.message?.includes('email change') || 
            (data?.user && data.user.email !== email)) {
          toast.info(
            <div className="space-y-1">
              <p className="font-medium">Email change confirmation required</p>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation email to {email}. Please check your inbox and click the confirmation link to complete the change.
              </p>
            </div>
          )
          setIsLoading(false)
          return
        }
        
        if (emailError) {
          throw emailError
        }
      }

      // Handle other settings changes
      let hasChanges = false
      let newAvatarUrl = null

      // Upload avatar if a new one was selected
      if (selectedFile) {
        newAvatarUrl = await uploadAvatar()
        hasChanges = true
      }

      // Update password if provided
      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match")
        }
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        })
        if (passwordError) throw passwordError
        hasChanges = true
      }

      // Update user metadata if avatar was changed
      if (newAvatarUrl) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            ...session.user.user_metadata,
            avatar_url: newAvatarUrl
          }
        })
        if (updateError) throw updateError
      }

      // Only show success and close if we made other changes
      if (hasChanges) {
        // Refresh the session to get the updated metadata
        const { data: { session: newSession } } = await supabase.auth.getSession()
        if (newSession?.user) {
          setUser(newSession.user)
          setAvatar(newSession.user.user_metadata?.avatar_url || null)
        }
        setPreviewUrl(null)
        setSelectedFile(null)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        
        toast.success("Settings updated successfully")
        onOpenChange(false)
      } else {
        toast.info("No changes to save")
      }
    } catch (error: any) {
      console.error('Error updating settings:', error)
      toast.error(error.message || "Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>Update your account settings. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Password</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full">
                <Avatar className="h-full w-full">
                  <AvatarImage 
                    src={previewUrl || avatar || "/placeholder.svg"} 
                    alt="User avatar"
                    className="object-cover"
                  />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <Upload className="h-4 w-4" />
                    Change Avatar
                  </div>
                  <Input 
                    id="avatar" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                  />
                </Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
