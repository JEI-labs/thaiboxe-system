export interface StudentCardProps {
  name: string;
  avatar: string;
  email: string;
  onDelete?: () => void;
  onEdit?: () => void;
}
