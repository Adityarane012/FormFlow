import { useEffect, useState } from "react";
import { 
  X, 
  Mail, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  UserPlus, 
  Globe,
  Settings2,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { inviteCollaborator, getFormCollaborators, removeCollaborator } from "@/lib/dataService";
import { useAuth } from "@/contexts/AuthContext";

interface ShareModalProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
  isPublicEdit?: boolean;
  onTogglePublic: (val: boolean) => void;
}

export function ShareModal({ 
  formId, 
  isOpen, 
  onClose, 
  publicUrl,
  isPublicEdit = false,
  onTogglePublic 
}: ShareModalProps) {
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collabs, setCollabs] = useState<any[]>([]);
  const [owner, setOwner] = useState<any>(null);
  const [isLoadingCollabs, setIsLoadingCollabs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, formId]);

  async function loadCollaborators() {
    setIsLoadingCollabs(true);
    try {
      const { owner, collaborators } = await getFormCollaborators(formId);
      setOwner(owner);
      setCollabs(collaborators);
    } catch (err) {
      console.error("Failed to load collaborators", err);
    } finally {
      setIsLoadingCollabs(false);
    }
  }

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsInviting(true);
    try {
      await inviteCollaborator(formId, email, role);
      toast.success(`${email} added as ${role}`);
      setEmail("");
      loadCollaborators();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite collaborator");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeCollaborator(formId, userId);
      toast.success("Collaborator removed");
      loadCollaborators();
    } catch (err) {
      toast.error("Failed to remove collaborator");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share Form</h2>
              <p className="text-xs font-medium text-gray-500">Manage who can edit this form</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-gray-100">
             <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Invite Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Invite Person
              </h3>
              <select 
                className="h-8 rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase border-none focus:ring-0 cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input 
                placeholder="Name or email..." 
                className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <Button disabled={isInviting} className="h-11 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
                Invite
              </Button>
            </form>
          </section>

          {/* Collaborator List Section */}
          <section className="space-y-3">
             <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <UserIcon className="h-3 w-3" />
              People with access
            </h3>
            <div className="space-y-2">
               {/* Owner */}
               {owner && (
                 <div className="flex items-center justify-between p-3 rounded-2xl border border-blue-50 bg-blue-50/20 group">
                    <div className="flex items-center gap-3">
                       <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {owner.name.substring(0, 1).toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">{owner.name}</p>
                          <p className="text-[11px] font-medium text-gray-500">{owner.email}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-100 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                       <ShieldCheck className="h-3 w-3" />
                       Owner
                    </div>
                 </div>
               )}

               {/* Collaborators */}
               {collabs.map((collab) => (
                 <div key={collab.userId} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                       <div className="h-9 w-9 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs uppercase">
                          {collab.name.substring(0, 1)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">{collab.name}</p>
                          <p className="text-[11px] font-medium text-gray-500">{collab.email}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {collab.role || "Editor"}
                       </div>
                       {owner?.id === currentUser?.id && (
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                           onClick={() => handleRemove(collab.userId)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}
                    </div>
                 </div>
               ))}

               {isLoadingCollabs && (
                 <div className="py-4 text-center text-xs text-gray-400 animate-pulse">Loading collaborators...</div>
               )}
            </div>
          </section>

          {/* Share Link Section */}
          <section className="space-y-3 pt-2">
             <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <LinkIcon className="h-3 w-3" />
              Edit Link
            </h3>
            <div className="flex items-center gap-2 p-2 pl-4 rounded-xl border border-gray-100 bg-gray-50/50 group hover:bg-white hover:border-gray-200 transition-all shadow-inner">
              <span className="flex-1 text-xs font-semibold text-gray-500 truncate">{publicUrl}</span>
              <Button size="sm" variant="ghost" onClick={copyLink} className="h-9 rounded-lg gap-2 text-blue-600 hover:bg-blue-50 font-bold">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy Edit Link
              </Button>
            </div>
          </section>

          {/* Public Toggle Section */}
          {owner?.id === currentUser?.id && (
            <section className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm transition-all hover:scale-110">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Public Edit Access</h4>
                    <p className="text-[11px] font-medium text-gray-400">Anyone with the link can edit</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={isPublicEdit}
                    onChange={(e) => onTogglePublic(e.target.checked)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </section>
          )}
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" />
              Secure builder collaboration
           </p>
        </div>
      </div>
    </div>
  );
}
