import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import type { UserType } from "@/types/data-types";

export function UserInfo({ user }: { user: UserType }) {
    const getInitials = useInitials();

    return (
        <>
            <div className="grid flex-1 text-right text-sm leading-tight">
                <span className="truncate text-neutral-800 font-semibold">
                    {user.name}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                    {user.role.name} {user.branch?.name}
                </span>
            </div>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
        </>
    );
}
