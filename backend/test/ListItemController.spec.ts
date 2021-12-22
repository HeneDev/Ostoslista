import { SuperAgentTest } from 'supertest';
import { Connection } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { app } from '../src/app';
import {
  List, ListItem, ListPermission, User,
} from '../src/entity';
import { clearDatabase, getDatabaseConnection } from './util/db';
import {
  createList, createListItem, createListOwner, createUser, randomString,
} from './util/factory';
import { ListItemState } from '../src/model';
import { createRequest } from './util/request';

describe('ListItemController', () => {
  let db: Connection;
  let request: SuperAgentTest;

  async function getDbItemCount() {
    return db.getRepository(ListItem).count();
  }

  function setOwnerForLists(owner: User, lists: List[]) {
    const permissions = lists.map((list) => createListOwner(list, owner));
    return db.getRepository(ListPermission).save(permissions);
  }

  beforeAll(async () => {
    db = await getDatabaseConnection();
  });

  beforeEach(async () => {
    const user = createUser('user1');
    await db.getRepository(User).save(user);

    request = createRequest(app, user);

    // Create 3 lists
    const list1 = createList('List #1', true, 'Fruits');
    const list2 = createList('List #2', true, 'Berries');
    const list3 = createList('List #3', true, 'Empty list');

    await db.getRepository(List).save([list1, list2, list3]);

    // Set list ownerships
    await setOwnerForLists(user, [list1, list2, list3]);

    // Create items for the lists
    await db.getRepository(ListItem).save([
      // List 1 items (8 total)
      createListItem('Apple', list1, {
        state: ListItemState.NONE,
        amount: 5.4,
        unit: 'pcs',
      }),
      createListItem('Pear', list1, {
        state: ListItemState.MISSING,
        amount: 4,
        unit: 'pcs',
      }),
      createListItem('Orange', list1, {
        state: ListItemState.NONE,
        amount: 11,
        unit: 'pcs',
      }),
      createListItem('Pineapple', list1, {
        state: ListItemState.MISSING,
        amount: 12,
        unit: 'pcs',
      }),
      createListItem('Peach', list1, {
        state: ListItemState.SELECTED,
        amount: 1.3,
        unit: 'kg',
      }),
      createListItem('Lime', list1, {
        state: ListItemState.SELECTED,
        amount: 9,
        unit: 'pcs',
      }),
      createListItem('Banana', list1, {
        state: ListItemState.SELECTED,
        amount: 7.9,
        unit: 'kg',
      }),
      createListItem('Tomato', list1, {
        state: ListItemState.MISSING,
        amount: 6.0,
        unit: 'pcs',
      }),
      // List 2 items (6 total)
      createListItem('Blackberry', list2, {
        state: ListItemState.MISSING,
        amount: 4.3,
        unit: 'litre',
      }),
      createListItem('Raspberry', list2, {
        state: ListItemState.MISSING,
        amount: 5.4,
        unit: 'litre',
      }),
      createListItem('Strawberry', list2, {
        state: ListItemState.SELECTED,
        amount: 3,
        unit: 'kg',
      }),
      createListItem('Blueberry', list2, {
        state: ListItemState.SELECTED,
        amount: 1.2,
        unit: 'g',
      }),
      createListItem('Cranberry', list2, {
        state: ListItemState.NONE,
        amount: 2,
        unit: 'litre',
      }),
      createListItem('Cloudberry', list2, {
        state: ListItemState.NONE,
        amount: 5,
        unit: 'litre',
      }),
    ]);
  });

  it('Get all list items for a list expect success', async () => {
    const listId = 1;
    const { status, body } = await request.get(`/lists/${listId}/items`);

    expect(status).toEqual(StatusCodes.OK);
    expect(body.objects).toHaveLength(8);
    expect(body.totalCount).toEqual(8);
  });

  it('Get single list with empty items expect success', async () => {
    const listId = 3;
    const { status, body } = await request.get(`/lists/${listId}/items`);

    expect(status).toEqual(StatusCodes.OK);
    expect(body.objects).toHaveLength(0);
    expect(body.totalCount).toEqual(0);
  });

  it('Get single non-existing list items expect not found', async () => {
    const listId = 1000;
    const { status, body } = await request.get(`/lists/${listId}/items`);

    expect(status).toEqual(StatusCodes.NOT_FOUND);
    expect(body).toHaveProperty('message');
  });

  it('Create list item expect success', async () => {
    const listId = 1;
    const list = await db.getRepository(List).findOne(listId);
    const expectedItemId = (await getDbItemCount()) + 1;

    const item = createListItem('Plum', list, {
      state: ListItemState.NONE,
      amount: 100,
      unit: 'pcs',
    });

    const { status, body } = await request
      .post(`/lists/${listId}/items`)
      .send(item);

    expect(status).toEqual(StatusCodes.CREATED);

    expect(body.id).toEqual(expectedItemId);
    expect(body.name).toEqual(item.name);
    expect(body.state).toEqual(item.state);
    expect(body.amount).toEqual(item.amount);
    expect(body.unit).toEqual(item.unit);
    expect(body.listId).toEqual(item.list.id);
  });

  it('Create list item for non-existing list expect not found', async () => {
    const listId = 1000;

    const count = await getDbItemCount();

    const item = createListItem('Plum', null);

    const { status } = await request
      .post(`/lists/${listId}/items`)
      .send(item);

    expect(status).toEqual(StatusCodes.NOT_FOUND);

    // Check that count has not changed
    expect(await getDbItemCount()).toEqual(count);
  });

  it('Create list item with invalid value expect bad request', async () => {
    const listId = 1;
    const count = await getDbItemCount();

    // Create too long name for the list item
    const name = randomString(256);
    const unit = 120;
    const amount = 'not-a-number';

    // Try to set list name to null
    const { status, body } = await request
      .post(`/lists/${listId}/items`)
      .send({ name, unit, amount });

    expect(status).toEqual(StatusCodes.BAD_REQUEST);
    expect(body.errors?.name).toBeDefined();
    expect(body.errors?.unit).toBeDefined();
    expect(body.errors?.amount).toBeDefined();

    // Check that count has not changed
    expect(await getDbItemCount()).toEqual(count);
  });

  it('Update list item expect success', async () => {
    const listId = 1;
    const itemId = 1;

    // Fetch existing list item from database
    const item = await db.getRepository(ListItem).findOneOrFail(itemId);

    item.name = 'New Name';
    item.state = ListItemState.SELECTED;
    item.amount = 9001;
    item.unit = 'mg';

    const { status } = await request
      .put(`/lists/${listId}/items/${itemId}`)
      .send(item);

    expect(status).toEqual(StatusCodes.ACCEPTED);

    // Fetch updated list from database
    const updatedList = await db.getRepository(ListItem).findOneOrFail(itemId);

    expect(updatedList.id).toEqual(itemId);
    expect(updatedList.name).toEqual(item.name);
    expect(updatedList.state).toEqual(item.state);
    expect(updatedList.amount).toEqual(item.amount);
    expect(updatedList.unit).toEqual(item.unit);
  });

  it('Update list item with invalid value expect bad request', async () => {
    const listId = 1;
    const itemId = 1;

    // Create too long name for the list item
    const name = randomString(256);
    const unit = randomString(128);
    const amount = -200;

    const { status, body } = await request
      .put(`/lists/${listId}/items/${itemId}`)
      .send({ name, unit, amount });

    expect(status).toEqual(StatusCodes.BAD_REQUEST);
    expect(body.errors?.name).toBeDefined();
  });

  it('Update non-existing list item expect not found', async () => {
    const listId = 1;
    const itemId = 1000;

    const { status } = await request
      .put(`/lists/${listId}/items/${itemId}`)
      .send({ name: 'new name' });

    expect(status).toEqual(StatusCodes.NOT_FOUND);
  });

  it('Update list item in non-existing list expect not found', async () => {
    const listId = 1000;
    const itemId = 1;

    const { status } = await request
      .put(`/lists/${listId}/items/${itemId}`)
      .send({ name: 'new name' });

    expect(status).toEqual(StatusCodes.NOT_FOUND);
  });

  it('Delete list item expect success', async () => {
    const count = await getDbItemCount();

    const listId = 1;
    const itemId = 2;
    const { status } = await request.delete(
      `/lists/${listId}/items/${itemId}`,
    );

    expect(status).toEqual(StatusCodes.OK);
    expect(await getDbItemCount()).toEqual(count - 1);
  });

  it('Delete non-existing list item expect not found', async () => {
    const count = await getDbItemCount();

    const listId = 1;
    const itemId = 1000;
    const { status } = await request.delete(
      `/lists/${listId}/items/${itemId}`,
    );

    expect(status).toEqual(StatusCodes.NOT_FOUND);

    // Check that count has not changed
    expect(await getDbItemCount()).toEqual(count);
  });

  it('Delete list item from non-existing list expect not found', async () => {
    const count = await getDbItemCount();

    const listId = 1000;
    const itemId = 1;
    const { status } = await request.delete(
      `/lists/${listId}/items/${itemId}`,
    );

    expect(status).toEqual(StatusCodes.NOT_FOUND);

    // Check that count has not changed
    expect(await getDbItemCount()).toEqual(count);
  });

  afterEach(async () => {
    await clearDatabase(db);
  });

  afterAll(async () => {
    await db.close();
  });
});
