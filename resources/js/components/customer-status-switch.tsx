import { Switch } from "./ui/switch";

export default function CustomerStatusSwitch({
    checked,
    onCheckedChange,
}: {
    checked: boolean;
    onCheckedChange: () => void;
}) {
    return <Switch checked={checked} onCheckedChange={onCheckedChange} />;
}
