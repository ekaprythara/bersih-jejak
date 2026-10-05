import { Switch } from "./ui/switch";

export default function BranchStatusSwitch({
    checked,
    onCheckedChange,
}: {
    checked: boolean;
    onCheckedChange: () => void;
}) {
    return <Switch checked={checked} onCheckedChange={onCheckedChange} />;
}
