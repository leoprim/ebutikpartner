"use client"
import { useState, useTransition } from "react"
import { Search, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import EditUserModal from "@/components/edit-user-modal"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersTable({ users, profiles, initialSearch }: { users: any[], profiles: any[], initialSearch?: string }) {
  const [editUser, setEditUser] = useState<any | null>(null)
  const [editProfile, setEditProfile] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, startSaving] = useTransition()
  const [userList, setUserList] = useState(users)
  const [profileList, setProfileList] = useState(profiles)
  const [search, setSearch] = useState(initialSearch || "")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [deleteUser, setDeleteUser] = useState<any | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  function getInitials(email: string, name?: string) {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.split("@")[0].slice(0, 2).toUpperCase()
    }
    return "U"
  }

  function getIsPremium(userId: string) {
    const profile = profileList.find((p: any) => p.id === userId)
    return profile?.is_premium === true
  }

  const totalUsers = userList.length
  const filteredUsers = search
    ? userList.filter((u: any) => {
        const email = (u.email || "").toLowerCase();
        const displayName = (u.user_metadata?.full_name || u.user_metadata?.name || email.split("@")[0] || "").toLowerCase();
        return email.includes(search.toLowerCase()) || displayName.includes(search.toLowerCase());
      })
    : userList

  // Bulk selection handlers
  const allVisibleUserIds = filteredUsers.map((u: any) => u.id)
  const isAllSelected = allVisibleUserIds.length > 0 && allVisibleUserIds.every(id => selectedUserIds.includes(id))
  const isIndeterminate = selectedUserIds.length > 0 && !isAllSelected

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(allVisibleUserIds)
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => prev.includes(userId)
      ? prev.filter(id => id !== userId)
      : [...prev, userId])
  }

  // Open modal handler
  const handleEdit = (user: any, profile: any) => {
    console.log("Edit user:", user, "Profile:", profile)
    setEditUser(user)
    setEditProfile(profile)
    setTimeout(() => setIsModalOpen(true), 0)
  }

  // Save handler
  const handleSave = async (updated: { avatar_url: string | null, name: string, email: string, is_premium: boolean }) => {
    // Validation
    if (!updated.name.trim()) {
      toast({ title: "Namn krävs", description: "Ange ett namn för användaren.", variant: "destructive" })
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(updated.email)) {
      toast({ title: "Ogiltig e-post", description: "Ange en giltig e-postadress.", variant: "destructive" })
      return
    }
    startSaving(async () => {
      let avatarUrl = updated.avatar_url
      try {
        // 1. Upload avatar if it's a file URL (optional: you may want to move this to an API route too)
        if (avatarUrl && avatarUrl.startsWith("blob:")) {
          toast({ title: "Avatar-uppladdning stöds inte direkt här. Lägg till separat API-route om du vill hantera detta säkert." })
          return
        }
        // 2. Call API route to update user
        const res = await fetch("/api/admin/update-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: editUser.id,
            name: updated.name,
            email: updated.email,
            avatar_url: avatarUrl,
            is_premium: updated.is_premium,
          }),
        })
        const result = await res.json()
        if (!res.ok) {
          toast({ title: "Fel", description: result.error, variant: "destructive" })
          return
        }
        // 3. Optimistically update UI
        setUserList((prev: any[]) => prev.map(u => u.id === editUser.id ? { ...u, email: updated.email, user_metadata: { ...u.user_metadata, full_name: updated.name, avatar_url: avatarUrl } } : u))
        setProfileList((prev: any[]) => {
          const existing = prev.find(p => p.id === editUser.id)
          if (existing) {
            // Update existing profile
            return prev.map(p => p.id === editUser.id ? { ...p, is_premium: updated.is_premium, email: updated.email } : p)
          } else {
            // Add new profile
            return [...prev, { id: editUser.id, is_premium: updated.is_premium, email: updated.email }]
          }
        })
        setIsModalOpen(false)
        toast({ title: "Användare uppdaterad", description: "Användarens information har sparats.", variant: "success" })
      } catch (err: any) {
        toast({ title: "Ett oväntat fel inträffade", description: err?.message || "Kunde inte spara ändringar.", variant: "destructive" })
      }
    })
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium">Användare <span className="text-base text-muted-foreground font-normal">({totalUsers})</span></h1>
            <p className="text-muted-foreground">Se och hantera alla användare i appen.</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <form className="w-full max-w-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Sök efter e-post eller namn..."
                className="w-full pl-8"
              />
            </div>
          </form>
          <AnimatePresence>
            {selectedUserIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="ml-4"
              >
                <Button
                  variant="destructive"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                >
                  Ta bort valda ({selectedUserIds.length})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Card>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {userList === undefined || userList === null ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 w-[48px] text-left align-middle"><Skeleton className="h-4 w-4" /></th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avatar</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Namn</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kontotyp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">E-post</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Skapad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Åtgärd</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {[...Array(6)].map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 w-[48px] text-left align-middle"><Skeleton className="h-4 w-4" /></td>
                          <td className="px-4 py-2"><Skeleton className="h-8 w-8 rounded-full" /></td>
                          <td className="px-4 py-2"><Skeleton className="h-6 w-32" /></td>
                          <td className="px-4 py-2"><Skeleton className="h-6 w-20" /></td>
                          <td className="px-4 py-2 font-medium"><Skeleton className="h-6 w-40" /></td>
                          <td className="px-4 py-2"><Skeleton className="h-6 w-24" /></td>
                          <td className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <motion.th
                          className="px-4 py-2 w-[48px] text-left align-middle"
                          animate={{ backgroundColor: isAllSelected ? 'rgba(34,197,94,0.08)' : 'rgba(0,0,0,0)' }}
                          transition={{ duration: 0.25 }}
                        >
                          <motion.div
                            animate={isAllSelected ? { scale: 1.1, opacity: 1 } : { scale: 1, opacity: 0.85 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          >
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label="Välj alla"
                              className="size-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              ref={el => { if (el) (el as any).indeterminate = isIndeterminate; }}
                            />
                          </motion.div>
                        </motion.th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avatar</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Namn</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kontotyp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">E-post</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Skapad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Åtgärd</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      <AnimatePresence>
                        {filteredUsers.map((user: any) => {
                          const avatarUrl = user.user_metadata?.avatar_url || "/placeholder.svg"
                          const initials = getInitials(user.email, user.user_metadata?.full_name || user.user_metadata?.name)
                          const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "—"
                          const isPremium = getIsPremium(user.id)
                          return (
                            <motion.tr
                              key={user.id}
                              layout
                              initial={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.25 }}
                              className="hover:bg-muted transition-colors group"
                            >
                              <motion.td
                                className="px-4 py-2 w-[48px] text-left align-middle"
                                animate={{ backgroundColor: selectedUserIds.includes(user.id) ? 'rgba(34,197,94,0.08)' : 'rgba(0,0,0,0)' }}
                                transition={{ duration: 0.25 }}
                              >
                                <motion.div
                                  animate={selectedUserIds.includes(user.id) ? { scale: 1.1, opacity: 1 } : { scale: 1, opacity: 0.85 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                >
                                  <Checkbox
                                    checked={selectedUserIds.includes(user.id)}
                                    onCheckedChange={() => handleSelectUser(user.id)}
                                    aria-label={`Välj ${user.email}`}
                                    className="size-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                </motion.div>
                              </motion.td>
                              <td className="px-4 py-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={avatarUrl} alt={user.email} />
                                  <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                              </td>
                              <td className="px-4 py-2">{displayName}</td>
                              <td className="px-4 py-2">
                                {isPremium ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">Premium</Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800 border-border" variant="outline">Standard</Badge>
                                )}
                              </td>
                              <td className="px-4 py-2 font-medium">{user.email}</td>
                              <td className="px-4 py-2">
                                {user.created_at ? (
                                  <span suppressHydrationWarning>
                                    {typeof window === "undefined"
                                      ? user.created_at.slice(0, 10)
                                      : new Date(user.created_at).toLocaleDateString("sv-SE")}
                                  </span>
                                ) : "—"}
                              </td>
                              <td className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(user, profileList.find((p: any) => p.id === user.id))}>Redigera</DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setDeleteUser(user)
                                        setIsDeleteModalOpen(true)
                                      }}
                                      className="text-red-600 focus:text-red-700"
                                    >
                                      Ta bort
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  Inga användare matchar filtret eller finns i Auth.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {editUser && (
        <EditUserModal open={isModalOpen} onOpenChange={setIsModalOpen} user={editUser} profile={editProfile} onSave={handleSave} isLoading={isSaving} />
      )}
      {/* Confirm Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-medium text-lg">Ta bort användare</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort användaren <span className="font-semibold">{deleteUser?.email}</span>? Detta går inte att ångra.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Avbryt</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                if (!deleteUser) return
                const userId = deleteUser.id
                setIsDeleting(true)
                try {
                  const res = await fetch('/api/admin/delete-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                  })
                  const result = await res.json()
                  if (!res.ok) {
                    toast({ title: 'Fel', description: result.error, variant: 'destructive' })
                  } else {
                    setUserList(prev => prev.filter(u => u.id !== userId))
                    setProfileList(prev => prev.filter(p => p.id !== userId))
                    toast({ title: 'Användare borttagen', description: `${deleteUser?.email} har tagits bort.`, variant: 'destructive' })
                  }
                } catch (err: any) {
                  toast({ title: 'Fel', description: err?.message || 'Kunde inte ta bort användaren.', variant: 'destructive' })
                } finally {
                  setIsDeleting(false)
                  setIsDeleteModalOpen(false)
                  setDeleteUser(null)
                }
              }}
              type="button"
            >
              {isDeleting ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block align-middle" /> : null}
              Ta bort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirm Bulk Delete Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-medium text-lg">Ta bort valda användare</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort <span className="font-semibold">{selectedUserIds.length}</span> användare? Detta går inte att ångra.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Avbryt</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isBulkDeleting}
              onClick={async () => {
                setIsBulkDeleting(true)
                try {
                  const res = await fetch('/api/admin/bulk-delete-users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userIds: selectedUserIds })
                  })
                  const result = await res.json()
                  if (!res.ok) {
                    toast({ title: 'Fel', description: result.error, variant: 'destructive' })
                  } else {
                    setUserList(prev => prev.filter(u => !selectedUserIds.includes(u.id)))
                    setProfileList(prev => prev.filter(p => !selectedUserIds.includes(p.id)))
                    toast({ title: 'Användare borttagna', description: `${selectedUserIds.length} användare har tagits bort.`, variant: 'destructive' })
                    setSelectedUserIds([])
                  }
                } catch (err: any) {
                  toast({ title: 'Fel', description: err?.message || 'Kunde inte ta bort användarna.', variant: 'destructive' })
                } finally {
                  setIsBulkDeleting(false)
                  setIsBulkDeleteModalOpen(false)
                }
              }}
              type="button"
            >
              {isBulkDeleting ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block align-middle" /> : null}
              Ta bort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 