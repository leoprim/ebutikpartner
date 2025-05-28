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
//import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tabs, Tab, Card, CardBody } from "@heroui/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Lock, Upload } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { addToast } from "@heroui/react"

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
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setEmail(user.email || "")
        setAvatar(user.user_metadata?.avatar_url || null)
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
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      // Upload avatar to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
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
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user) throw new Error("Ingen användare hittad")

      // Handle email change separately
      if (email !== user.email) {
        const { data, error: emailError } = await supabase.auth.updateUser({
          email: email
        })
        
        // Check if we got a response indicating email confirmation is needed
        if (emailError?.message?.includes('email change') || 
            (data?.user && data.user.email !== email)) {
          addToast({ title: "Bekräftelse av ändring via e-post krävs", color: "primary" })
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
          throw new Error("Lösenorden matchar inte")
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
            ...user.user_metadata,
            avatar_url: newAvatarUrl
          }
        })
        if (updateError) throw updateError
      }

      // Only show success and close if we made other changes
      if (hasChanges) {
        // Refresh the session to get the updated metadata
        const { data: { user: newUser } } = await supabase.auth.getUser()
        if (newUser) {
          setUser(newUser)
          setAvatar(newUser.user_metadata?.avatar_url || null)
        }
        setPreviewUrl(null)
        setSelectedFile(null)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        
        addToast({ title: "Inställningarna har uppdaterats", color: "success" })
        onOpenChange(false)
      } else {
        addToast({ title: "Inga ändringar att spara", color: "primary" })
      }
    } catch (error: any) {
      console.error('Error updating settings:', error)
      addToast({ title: error.message || "Misslyckades att uppdatera inställningarna", color: "danger" })
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
          <DialogTitle>Kontoinställningar</DialogTitle>
          <DialogDescription>Uppdatera dina kontoinställningar. Klicka på spara när du är klar.</DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-col">
          <Tabs aria-label="Kontoinställningar" defaultSelectedKey="profile">
            <Tab
              key="profile"
              title={
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </span>
              }
            >
              <Card>
                <CardBody>
                  <div className="space-y-4 py-4">
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
                            Ändra profilbild
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
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="email"
              title={
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">E-post</span>
                </span>
              }
            >
              <Card>
                <CardBody>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-post</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="namn@ebutikpartner.se"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="password"
              title={
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Lösenord</span>
                </span>
              }
            >
              <Card>
                <CardBody>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Nuvarande lösenord</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nytt lösenord</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Bekräfta nytt lösenord</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Avbryt
          </Button>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? "Sparar..." : "Spara ändringar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
