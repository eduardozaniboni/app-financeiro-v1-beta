import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/use-auth";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : "";
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    const charCodeSum = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback className={getAvatarColor(user.email)}>
            {getInitials(user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-foreground">{user.email}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Plano Ativo: Pro</DropdownMenuLabel>
        <DropdownMenuItem disabled>Gerenciar Plano</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          logout();
          navigate("/auth");
        }}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
