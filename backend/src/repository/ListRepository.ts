import { InternalServerError } from 'routing-controllers';
import {
  EntityRepository, getCustomRepository, IsNull, Not, Repository,
} from 'typeorm';
import { ListItemRepository } from './ListItemRepository';
import { List, ListItem, User } from '../entity';
import { NotFoundException } from '../exception';
import { PermissionService } from '../services/PermissionService';
import { UserRight } from '../model';

interface ListOptions {
  limit: number;
  offset: number;
  category?: string;
  isTemplate?: boolean;
  isFinished?: boolean;
  isDeleted?: boolean;
  startDateRange?: Date;
  endDateRange?: Date;
  stringYearMonth?: string;

}

@EntityRepository(List)
export class ListRepository extends Repository<List> {
  private readonly listItemRepository = getCustomRepository(ListItemRepository);

  private readonly permissionService = new PermissionService();

  /**
   * Returns a list with given ID.
   */
  async getList(id: number, user: User) {
    try {
      return await this.getListQueryBuilder(user.id)
        .where({ id })
        .getOneOrFail()
        .then((list) => {
          // List items are manually sorted here
          // because sorting with TypeORM causes problems
          this.sortListItems(list);
          return list;
        });
    } catch {
      throw new NotFoundException(this.target, { id });
    }
  }

  /**
   * Returns all lists with total count.
   */
  async getLists(user: User, options: ListOptions) {
    const {
      limit,
      offset,
      category,
      isTemplate,
      isFinished,
      isDeleted,
      startDateRange,
      endDateRange,
      stringYearMonth,

    } = options;

    const query = this.getListQueryBuilder(user.id);

    // Category filtering
    if (category && category.length > 0) {
      query.andWhere({ category });
    }

    // Template filtering
    if (isTemplate !== undefined) {
      query.andWhere({ isTemplate });
    }

    // Finished filtering
    if (isFinished !== undefined) {
      query.andWhere({ finishedAt: isFinished ? Not(IsNull()) : IsNull() });
    }

    // Deleted filtering. Disabling global "non-deleted" condition is necessary
    if (isDeleted) {
      query.andWhere({ deletedAt: isDeleted ? Not(IsNull()) : IsNull() })
        .withDeleted();
    }

    // Query finsihed lists by date range
    if (startDateRange && endDateRange) {
      query.andWhere('DATE_TRUNC(\'DAY\', "finishedAt")::timestamp::date BETWEEN :startDate AND :endDate', { startDate: startDateRange, endDate: endDateRange });
    }

    // Query finished lists by year and month
    if (stringYearMonth) {
      query.andWhere('to_char("finishedAt", \'YYYY-MM\') = :stringYearMonth', { stringYearMonth: stringYearMonth });
    }

    // Pagination
    query.skip(offset).take(limit);

    try {
      return await query.getManyAndCount()
        .then((lists) => {
          // List items are manually sorted here
          // because sorting with TypeORM causes problems
          lists[0].forEach(this.sortListItems);
          return lists;
        });
    } catch (error) {
      throw new InternalServerError('Failed to fetch lists');
    }
  }

  /**
   * Saves a given list in the database with list items.
   * @param list New list.
   * @param items New list items added to new list.
   */
  async saveList(list: List, items: ListItem[], owner: User) {
    const newList = await super.save(list);

    if (items.length > 0) {
      items.forEach((item) => {
        item.list = newList;
      });

      try {
        // Save the list items
        await this.listItemRepository.save(items);
      } catch (error) {
        console.log(error);
        throw new InternalServerError(`Failed to save list items: ${error}`);
      }
    }

    try {
      // Save the list ownership
      await this.permissionService.setPermission(newList, owner, UserRight.OWNER);
    } catch (error) {
      console.log(error);
      throw new InternalServerError(`Failed to save list ownership: ${error}`);
    }

    return this.getList(newList.id, owner);
  }

  private getListQueryBuilder(userId: number) {
    return this.createQueryBuilder('list')
      .leftJoinAndSelect('list.items', 'item')
      // Join permissions
      .innerJoin('list.permissions', 'permission')
      // Find lists which user any has permission
      .andWhere('permission.user.id = :userId', { userId })
      // Find lists which user has correct user type
      .andWhere('permission.userRight IN (:...types)', { types: this.permissionService.getAllowedUserRights('READ') })
      // Because of bug in TypeORM sorting by relation field
      // breaks pagination. See:
      // https://github.com/typeorm/typeorm/issues/3356
      // and https://github.com/typeorm/typeorm/issues/8295
      // .addOrderBy('item.id', 'ASC');
      .orderBy('list.id', 'ASC');
  }

  /**
   * Sorts list items id in ascending order.
   */
  private sortListItems(list: List) {
    list.items.sort((a, b) => a.id - b.id);
  }
}
