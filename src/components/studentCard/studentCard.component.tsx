import { getInitials } from "@/utils/masksUtils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";
import { StudentCardProps } from "./studentCard.types";

export const StudentCard: React.FC<StudentCardProps> = ({
  name,
  avatar,
  email,
}) => {
  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 lg:flex">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-medium">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="mr-2 flex gap-3">
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
