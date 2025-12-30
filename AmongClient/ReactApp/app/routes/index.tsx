import type { MetaFunction } from "@remix-run/react";
import AmongPlayer from "~/among/AmongPlayer";

export const meta: MetaFunction = () => {
  return [
    { title: "Among RL Player" },
    { name: "description", content: "Play Among RL!" },
  ];
};

export default function Index() {
  return <AmongPlayer />;
}
