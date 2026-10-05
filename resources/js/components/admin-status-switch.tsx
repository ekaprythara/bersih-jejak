import { Switch } from "./ui/switch";

export default function AdminStatusSwitch({
    checked,
    onCheckedChange,
}: {
    checked: boolean;
    onCheckedChange: () => void;
}) {
    return <Switch checked={checked} onCheckedChange={onCheckedChange} />;
}
