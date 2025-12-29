import type { Route } from "./+types/home";
import AmongPlayer from '~/among/AmongPlayer';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Among RL Player" },
    { name: "description", content: "Play Among RL!" },
  ];
}

export default function Index() {
  return <AmongPlayer />;
}
