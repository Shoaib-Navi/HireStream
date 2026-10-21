import { useState } from "react";
import { toast } from "sonner";
import LoadingButton from "@/components/common/LoadingButton";
import UserAvatar from "@/components/common/UserAvatar";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { formatRelativeTime } from "@/lib/format";
import { useAddApplicationNoteMutation } from "../api";

// Notes about an applicant that only the recruiting side can see
const PrivateNotes = ({ applicationId, notes = [] }) => {
  const [addNote, { isLoading }] = useAddApplicationNoteMutation();
  const [body, setBody] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addNote({ id: applicationId, body: body.trim() }).unwrap();
      setBody("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      {notes.length === 0 ? (
        <p className="type-body text-muted-foreground">No notes yet. Candidates never see these.</p>
      ) : (
        <ul className="space-y-4">
          {[...notes].reverse().map((note) => (
            <li key={note._id} className="flex gap-3">
              <UserAvatar user={note.author} size="xs" />
              <div className="min-w-0">
                <p className="type-caption text-muted-foreground">
                  <span className="font-medium text-foreground">{note.author?.fullName ?? "Recruiter"}</span> ·{" "}
                  {formatRelativeTime(note.createdAt)}
                </p>
                <p className="type-body mt-1 whitespace-pre-line text-foreground">{note.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="private-note" className="sr-only">
          New note
        </label>
        <Textarea
          id="private-note"
          rows={3}
          maxLength={2000}
          placeholder="Add a note for your team…"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <LoadingButton type="submit" variant="outline" size="sm" loading={isLoading} disabled={!body.trim()}>
          Add note
        </LoadingButton>
      </form>
    </div>
  );
};

export default PrivateNotes;
