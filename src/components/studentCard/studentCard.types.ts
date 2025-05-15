export interface StudentCardProps {
  name: string;
  avatar: string;
  email: string;
  status: string;
  onDelete?: () => void;
  onEdit?: () => void;
}
