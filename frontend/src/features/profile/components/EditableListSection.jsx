import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SectionCard from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/errors";

const NEW_ITEM = -1;

// Errors for list items come back as "experience.2.endDate"; keep the ones for the edited item
const errorsForItem = (error, index) =>
  Object.fromEntries(
    (error?.errors ?? [])
      .map((item) => ({ ...item, parts: item.field.split(".") }))
      .filter((item) => item.parts[1] === String(index))
      .map((item) => [item.parts.slice(2).join("."), item.message]),
  );

// A profile section holding a list (experience, education) edited through a dialog.
// renderForm receives { key, initialValues, errors, saving, onSubmit, onCancel }.
const EditableListSection = ({ id, title, description, addLabel, emptyText, items, saving, onSave, renderItem, renderForm }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const isOpen = editingIndex !== null;

  const close = () => {
    setEditingIndex(null);
    setFormErrors({});
  };

  const persist = async (nextItems, successMessage, index) => {
    try {
      await onSave(nextItems);
      toast.success(successMessage);
      close();
    } catch (error) {
      setFormErrors(errorsForItem(error, index));
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmit = (values) => {
    if (editingIndex === NEW_ITEM) {
      return persist([...items, values], "Added", items.length);
    }
    return persist(
      items.map((item, index) => (index === editingIndex ? values : item)),
      "Saved",
      editingIndex,
    );
  };

  const handleRemove = (index) => persist(items.filter((_, itemIndex) => itemIndex !== index), "Removed", index);

  return (
    <SectionCard
      id={id}
      title={title}
      description={description}
      action={
        <Button variant="outline" size="sm" onClick={() => setEditingIndex(NEW_ITEM)}>
          <Plus /> {addLabel}
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="type-body text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="divide-y">
          {items.map((item, index) => (
            <li key={item._id ?? index} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">{renderItem(item)}</div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditingIndex(index)}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Remove" disabled={saving} onClick={() => handleRemove(index)}>
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingIndex === NEW_ITEM ? addLabel : `Edit ${title.toLowerCase()}`}</DialogTitle>
            <DialogDescription className="sr-only">{description}</DialogDescription>
          </DialogHeader>
          {isOpen &&
            renderForm({
              key: editingIndex,
              initialValues: editingIndex === NEW_ITEM ? null : items[editingIndex],
              errors: formErrors,
              saving,
              onSubmit: handleSubmit,
              onCancel: close,
            })}
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
};

export default EditableListSection;
