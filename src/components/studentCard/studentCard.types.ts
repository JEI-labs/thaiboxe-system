export interface StudentCardProps {
  name: string;
  avatar: string;
  email: string;
  status: string;
  planName: string;
  onDelete?: () => void;
  onEdit?: () => void;
}
