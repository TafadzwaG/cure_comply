import { FrameworkBuilder } from './builder';

export default function FrameworkShow(props: Parameters<typeof FrameworkBuilder>[0]) {
    return <FrameworkBuilder {...props} mode="edit" />;
}
