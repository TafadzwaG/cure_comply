import { FrameworkBuilder } from './builder';

export default function FrameworkEdit(props: Parameters<typeof FrameworkBuilder>[0]) {
    return <FrameworkBuilder {...props} mode="edit" />;
}
