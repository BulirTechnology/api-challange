import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { QueueName } from "../queue.interface";
import { Queue } from "bull";

type SendEmailQueueProps = {
  name: string
  email: string
}

@Injectable()
export class SendEmailQueueService {
  constructor(@InjectQueue(QueueName.email) private sendEmailQueue: Queue) { }

  async execute(params: SendEmailQueueProps) {
    const data = {
      message: "Ola mundo => " + params.name + ":" + params.email,
      priority: 2,
      foo: "bar"
    };
    try {
      console.log("entrou aqui");
      const result = await this.sendEmailQueue.add(data);
  
      console.log("result: ", result);
    } catch(err) {
      console.log("deu erro oa add");
      console.log(err);
    }
    console.log("fez tudo: ");
  }
}