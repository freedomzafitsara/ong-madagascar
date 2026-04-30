import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Subscriber)
    private subscriberRepository: Repository<Subscriber>,
  ) {}

  async subscribe(subscribeDto: SubscribeDto): Promise<Subscriber> {
    const existing = await this.subscriberRepository.findOne({
      where: { email: subscribeDto.email },
    });

    if (existing) {
      throw new ConflictException('Cet email est déjà abonné');
    }

    const subscriber = this.subscriberRepository.create({
      email: subscribeDto.email,
      name: subscribeDto.name,
    });

    return this.subscriberRepository.save(subscriber);
  }

  async unsubscribe(email: string): Promise<void> {
    await this.subscriberRepository.delete({ email });
  }

  async findAll(): Promise<Subscriber[]> {
    return this.subscriberRepository.find({
      order: { subscribedAt: 'DESC' },
    });
  }

  async countSubscribers(): Promise<number> {
    return this.subscriberRepository.count();
  }
}
