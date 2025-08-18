import MemoryCreationForm from './MemoryCreationForm';

interface CreateMemoryModalProps {
  open: boolean;
  onClose: () => void;
  onMemoryCreated?: (memory: any) => void;
}

export default function CreateMemoryModal({ open, onClose, onMemoryCreated }: CreateMemoryModalProps) {
  return (
    <MemoryCreationForm 
      open={open} 
      onClose={onClose} 
      onMemoryCreated={onMemoryCreated}
    />
  );
}