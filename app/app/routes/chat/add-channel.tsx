import { redirect } from "react-router";
import type { Route } from "../+types/chat/add-channel";
import { prisma } from "~/lib/prisma";
import { uuidv7 } from "uuidv7";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");

  const channel = await prisma.channel.create({
    data: {
      id: uuidv7(),
      name: name as string,
      created_at: new Date(),
    },
  });

  return redirect(`/chat/channel/${channel.id}`);
}
