import {
  List, ListItem, ListPermission, User,
} from '../../src/entity';
import { UserRight } from '../../src/model';

export function createUser(name: string) {
  const user = new User();
  user.username = name;
  user.email = `${name}@example.com`;
  user.password = 'password';
  return user;
}

export function createList(
  name: string,
  isTemplate: boolean,
  description?: string,
  category?: string,
  items?: ListItem[],
) {
  const list = new List();
  list.name = name;
  list.isTemplate = isTemplate;
  list.description = description;
  list.category = category;
  list.items = items ?? [];
  return list;
}

export function createListOwner(list: List, owner: User) {
  const permission = new ListPermission();
  permission.list = list;
  permission.user = owner;
  permission.userRight = UserRight.OWNER;
  return permission;
}

export function createListItem(
  name: string,
  list?: List,
  options?: Partial<Omit<ListItem, 'name' | 'list'>>,
) {
  const item = new ListItem();
  item.name = name;
  item.list = list;
  item.state = options?.state ?? undefined;
  item.price = options?.price ?? undefined;
  item.amount = options?.amount ?? undefined;
  item.unit = options?.unit ?? undefined;
  return item;
}

export function randomString(length: number) {
  return new Array(length).join('-');
}
