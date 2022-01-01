import { chatRoom, Action, ParamsFrom } from "actionhero";

export class CreateChatRoom extends Action {
  name = "createChatRoom";
  description = "I will create a chatroom with the given name";
  inputs = {
    name: {
      required: true,
    },
  };

  async run({ params }: { params: ParamsFrom<CreateChatRoom> }) {
    const didCreate = await chatRoom.add(params.name);
    return { didCreate };
  }
}
