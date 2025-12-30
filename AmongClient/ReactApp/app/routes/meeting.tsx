import type { MetaFunction } from "@remix-run/react";
import Meeting from "~/among/Meeting";

export const meta: MetaFunction = () => {
  return [
    { title: "Among RL Meeting" },
    { name: "description", content: "Meeting for Among RL!" },
  ];
};

export default function MeetingPage() {
  return <Meeting />;
}