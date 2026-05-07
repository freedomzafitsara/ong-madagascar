// src/common/services/pagination.service.ts
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class PaginationService {
  /**
   * Paginer les résultats d'une requête
   * @param repository - Le repository TypeORM
   * @param options - Options de pagination
   * @returns Résultat paginé
   */
  static async paginate<T>(
    repository: Repository<T>,
    options: {
      page?: number;
      limit?: number;
      filters?: FindOptionsWhere<T>;
      orderBy?: keyof T;
      orderDirection?: 'ASC' | 'DESC';
    } = {},
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const orderBy = options.orderBy || 'createdAt' as keyof T;
    const orderDirection = options.orderDirection || 'DESC';

    const findOptions: FindManyOptions<T> = {
      where: options.filters || {},
      skip,
      take: limit,
      order: {
        [orderBy]: orderDirection,
      } as any,
    };

    const [data, total] = await repository.findAndCount(findOptions);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}