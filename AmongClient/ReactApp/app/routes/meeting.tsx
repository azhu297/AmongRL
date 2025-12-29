import type { Route } from "./+types/home";
import { Welcome } from "~/welcome/welcome";
import SoundButton from '~/among/SoundButton';
import SoundButtonServerTriggered from '~/among/SoundButtonServerTriggered';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Among RL Meeting" },
    { name: "description", content: "Meeting for Among RL!" },
  ];
}

export default function Index() {
  return <SoundButtonServerTriggered />;
}
