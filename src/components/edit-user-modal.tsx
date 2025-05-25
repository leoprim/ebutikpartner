import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload } from "lucide-react"
import { useEffect } from "react"

export default function EditUserModal({ open, onOpenChange, user, profile, onSave, isLoading = false }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  user: any,
  profile: any,
  onSave: (updated: { avatar_url: string | null, name: string, email: string, is_premium: boolean }) => void,
  isLoading?: boolean
}) {
  const [avatar, setAvatar] = useState(user.user_metadata?.avatar_url || "/placeholder.svg")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState(user.user_metadata?.full_name || user.user_metadata?.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [isPremium, setIsPremium] = useState(profile?.is_premium === true)

  useEffect(() => {
    setAvatar(user.user_metadata?.avatar_url || "/placeholder.svg")
    setPreviewUrl(null)
    setSelectedFile(null)
    setName(user.user_metadata?.full_name || user.user_metadata?.name || "")
    setEmail(user.email || "")
    setIsPremium(profile?.is_premium === true)
  }, [user, profile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setSelectedFile(file)
  }

  const handleSave = async () => {
    // Avatar upload logic should be handled in parent (onSave)
    onSave({
      avatar_url: previewUrl || avatar,
      name,
      email,
      is_premium: isPremium,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-medium text-lg">Redigera användare</DialogTitle>
          <DialogDescription>Uppdatera användarens information och premiumstatus.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-2">
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
            <Avatar className="h-full w-full">
              <AvatarImage src={previewUrl || avatar} alt={name || email} className="object-cover" />
              <AvatarFallback>{(name || email).slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Upload className="h-4 w-4" />
              Ändra profilbild
            </div>
            <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isLoading} />
          </Label>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Namn</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="email">E-post</Label>
            <Input id="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="premium">Premium</Label>
            <Checkbox id="premium" checked={isPremium} onCheckedChange={checked => setIsPremium(checked === true)} disabled={isLoading} />
            {isPremium ? (
              <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">Premium</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 border-border" variant="outline">Standard</Badge>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading} type="button">Spara</Button>
          <DialogClose asChild>
            <Button variant="outline" type="button">Avbryt</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 