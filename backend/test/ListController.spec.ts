import { SuperAgentTest } from 'supertest';
import { Connection, FindManyOptions, In } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { app } from '../src/app';
import {
  List, ListItem, ListPermission, User,
} from '../src/entity';
import { clearDatabase, getDatabaseConnection } from './util/db';
import {
  createList, createListItem, createListOwner, createUser, randomString,
} from './util/factory';
import { createRequest } from './util/request';

describe('ListController', () => {
  let db: Connection;
  let request: SuperAgentTest;

  /**
   * Returns count of lists in database.
   */
  async function getDbListCount(options?: FindManyOptions<List>) {
    return db.getRepository(List).count(options);
  }

  /**
   * Returns an array of list ids in database.
   */
  async function getDbListIds(options?: FindManyOptions<List>) {
    return db.getRepository(List).find(options).then((lists) => lists.map(({ id }) => id));
  }

  async function setOwnerForLists(owner: User, lists: List[]) {
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

    // Create 4 lists
    const list1 = createList('List #1', false, 'Fruits', 'Groceries');
    const list2 = createList('List #2', false, 'Berries', 'Groceries');
    const list3 = createList('List #3', false, null);
    const list4 = createList('List #4', false, 'Empty list', 'Christmas');
    const list5 = createList('List #5', true, 'Empty template', null);

    await db.getRepository(List).save([list1, list2, list3, list4, list5]);

    // Set list ownerships
    await setOwnerForLists(user, [list1, list2, list3, list4, list5]);

    // Create items for the lists
    await db.getRepository(ListItem).save([
      // List 1 items
      createListItem('Apple', list1),
      createListItem('Pear', list1),
      createListItem('Orange', list1),
      // List 2 items
      createListItem('Blackberry', list2),
      createListItem('Raspberry', list2),
      // List 3 items
      createListItem('Carrot', list3),
      createListItem('Potato', list3),
      createListItem('Wheat', list3),
      createListItem('Barley', list3),
    ]);
  });

  describe('Get requests', () => {
    it('Get all lists expect success', async () => {
      const count = await getDbListCount({ where: { isTemplate: false } });
      const { status, body } = await request.get('/lists');

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(count);
      expect(body.totalCount).toEqual(count);
    });

    it('Get all template lists expect success', async () => {
      const templateIds = await getDbListIds({ where: { isTemplate: true } });

      const { status, body } = await request.get('/lists?isTemplate=true');

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(templateIds.length);
      expect(body.totalCount).toEqual(templateIds.length);

      expect(body.objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: templateIds[0], isTemplate: true }),
        ]),
      );
    });

    it('Get all deleted lists expect success', async () => {
      const date = new Date();

      // Simulate soft delete
      await db.getRepository(List).update({ id: In([1, 2]) }, { deletedAt: date });

      const { status, body } = await request.get('/lists?isDeleted=true');

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(2);
      expect(body.totalCount).toEqual(2);

      // Expect all objects to contain same deletedAt value
      expect(body.objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, deletedAt: date.toISOString() }),
          expect.objectContaining({ id: 2, deletedAt: date.toISOString() }),
        ]),
      );
    });

    it('Get all finished lists expect success', async () => {
      const date = new Date();

      // Set finishedAt property for two tables
      await db.getRepository(List).update({ id: In([2, 3]) }, { finishedAt: date });

      const { status, body } = await request.get('/lists?isFinished=true');

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(2);
      expect(body.totalCount).toEqual(2);

      // Expect all objects to contain same finishedAt value
      expect(body.objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 2, finishedAt: date.toISOString() }),
          expect.objectContaining({ id: 3, finishedAt: date.toISOString() }),
        ]),
      );
    });

    it('Get single list with items expect success', async () => {
      const id = 3;
      const { status, body } = await request.get(`/lists/${id}`);
      expect(status).toEqual(StatusCodes.OK);

      expect(body.id).toEqual(id);
      expect(body.name).toEqual('List #3');
      expect(body.description).toBeNull();

      expect(body.items).toHaveLength(4);
      expect(body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Carrot' }),
          expect.objectContaining({ name: 'Potato' }),
          expect.objectContaining({ name: 'Wheat' }),
          expect.objectContaining({ name: 'Barley' }),
        ]),
      );
    });

    it('Get single list with empty items expect success', async () => {
      const id = 4;
      const { status, body } = await request.get(`/lists/${id}`);
      expect(status).toEqual(StatusCodes.OK);

      expect(body.id).toEqual(id);
      expect(body.name).toEqual('List #4');
      expect(body.description).toEqual('Empty list');
      expect(body.items).toEqual([]);
    });

    it('Get single non-existing list expect not found', async () => {
      const id = 1000;
      const { status, body } = await request.get(`/lists/${id}`);
      expect(status).toEqual(StatusCodes.NOT_FOUND);

      expect(body).toHaveProperty('message');
    });

    it('Get all lists with certain category expect success', async () => {
      const category = 'Groceries';

      const { status, body } = await request.get(`/lists?category=${category}`);

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(2);
      expect(body.totalCount).toEqual(2);

      expect(body.objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'List #1', category }),
          expect.objectContaining({ name: 'List #2', category }),
        ]),
      );
    });
  });

  describe('Post requests', () => {
    it('Create list expect success', async () => {
      const expectedId = (await getDbListCount()) + 1;

      const list = createList('List #5', true, 'New list', 'Category');

      const { status, body } = await request.post('/lists').send(list);

      expect(status).toEqual(StatusCodes.CREATED);

      expect(body.id).toEqual(expectedId);
      expect(body.name).toEqual(list.name);
      expect(body.isTemplate).toEqual(list.isTemplate);
      expect(body.category).toEqual(list.category);
      expect(body.description).toEqual(list.description);
    });

    it('Create list with items expect success', async () => {
      const expectedId = (await getDbListCount()) + 1;

      const items = [
        createListItem('Item #1'),
        createListItem('Item #2'),
      ];

      const list = createList('List #6', true, 'New list with items', 'Category', items);

      const { status, body } = await request.post('/lists').send(list);

      expect(status).toEqual(StatusCodes.CREATED);

      expect(body.id).toEqual(expectedId);
      expect(body.name).toEqual(list.name);
      expect(body.description).toEqual(list.description);
      expect(body.items).toHaveLength(items.length);

      expect(body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Item #1' }),
          expect.objectContaining({ name: 'Item #2' }),
        ]),
      );
    });

    it('Create list with invalid value expect bad request', async () => {
      const count = await getDbListCount();

      // Create too long name for the list
      const name = randomString(256);

      // Try to set list name to null
      const { status, body } = await request
        .post('/lists')
        .send({ name, description: 'New list' });

      expect(status).toEqual(StatusCodes.BAD_REQUEST);
      expect(body.errors?.name).toBeDefined();

      // Check that count has not changed
      expect(await getDbListCount()).toEqual(count);
    });

    it('Create list without isTemplate value expect default to false', async () => {
      // Do not send defined 'isTemplate' value
      const { status, body } = await request
        .post('/lists')
        .send({ name: 'Name' });

      expect(status).toEqual(StatusCodes.CREATED);

      expect(body.isTemplate).toEqual(false);
    });
  });

  describe('Put requests', () => {
    it('Update list expect success', async () => {
      const id = 1;

      // Fetch existing list from database
      const list = await db.getRepository(List).findOneOrFail(id);

      list.name = 'New Name';
      list.description = 'New description';
      list.category = 'New category';
      list.price = 9001.89;
      // Try to empty list items (should not succeed)
      list.items = [];

      const { status } = await request.put(`/lists/${id}`)
        .send({ ...list, finished: true });

      expect(status).toEqual(StatusCodes.ACCEPTED);

      // Fetch updated list from database
      const updatedList = await db.getRepository(List).findOneOrFail(id);

      expect(updatedList.id).toEqual(id);
      expect(updatedList.name).toEqual(list.name);
      expect(updatedList.description).toEqual(list.description);
      expect(updatedList.category).toEqual(list.category);
      expect(updatedList.price).toEqual(list.price);
      expect(updatedList.finishedAt).not.toEqual(null);
      expect(updatedList.items.length).toBeGreaterThan(0);
    });

    it('Update list with invalid value expect bad request', async () => {
      const id = 1;

      // Create too long name for the list
      const name = randomString(256);

      const { status, body } = await request
        .put(`/lists/${id}`)
        .send({ name, price: -1.22 });

      expect(status).toEqual(StatusCodes.BAD_REQUEST);
      expect(body.errors?.name).toBeDefined();
      expect(body.errors?.price).toBeDefined();
    });

    it('Update non-existing list expect not found', async () => {
      const id = 1000;

      const { status } = await request
        .put(`/lists/${id}`)
        .send({ name: 'new name' });

      expect(status).toEqual(StatusCodes.NOT_FOUND);
    });
  });

  describe('Delete requests', () => {
    it('Delete list expect success', async () => {
      const count = await getDbListCount();

      const id = 1;
      const { status } = await request.delete(`/lists/${id}`);

      expect(status).toEqual(StatusCodes.OK);
      expect(await getDbListCount()).toEqual(count - 1);
    });

    it('Delete non-existing list expect not found', async () => {
      const count = await getDbListCount();

      const id = 1000;
      const { status } = await request.delete(`/lists/${id}`);

      expect(status).toEqual(StatusCodes.NOT_FOUND);

      // Check that count has not changed
      expect(await getDbListCount()).toEqual(count);
    });
  });

  describe('Pagination', () => {
    it('Return all lists if n of lists in db does not exceed limit and offset is 0', async () => {
      const limit = 25;
      const offset = 0;
      const lists = await getDbListIds({ skip: offset, take: limit, where: { isTemplate: false } });
      const total = await getDbListCount({ where: { isTemplate: false } });

      const { status, body } = await request
        .get(`/lists?limit=${limit}&offset=${offset}`);

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(lists.length);
      expect(body.objects).toEqual(
        expect.arrayContaining(
          lists.map((id) => expect.objectContaining({ id })),
        ),
      );
      expect(body.totalCount).toEqual(total);
    });

    it('Limit of 2 only returns the first two lists', async () => {
      const limit = 2;
      const offset = 0;
      const lists = await getDbListIds({ skip: offset, take: limit, where: { isTemplate: false } });
      const total = await getDbListCount({ where: { isTemplate: false } });

      const { status, body } = await request
        .get(`/lists?limit=${limit}&offset=${offset}`);

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(limit);
      expect(body.objects).toEqual(
        expect.arrayContaining(
          lists.map((id) => expect.objectContaining({ id })),
        ),
      );
      expect(body.totalCount).toEqual(total);
    });

    it('Offset 1 returns all but first list', async () => {
      const limit = 25;
      const offset = 1;
      const lists = await getDbListIds({ skip: offset, take: limit, where: { isTemplate: false } });
      const total = await getDbListCount({ where: { isTemplate: false } });

      const { status, body } = await request
        .get(`/lists?limit=${limit}&offset=${offset}`);

      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toHaveLength(total - offset);
      expect(body.objects).toEqual(
        expect.arrayContaining(
          lists.map((id) => expect.objectContaining({ id })),
        ),
      );
      expect(body.totalCount).toEqual(total);
    });

    it('Does not accecpt negative offsets', async () => {
      const limit = 25;
      const offset = -1;

      const { status } = await request
        .get(`/lists?limit=${limit}&offset=${offset}`);

      expect(status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('Does not accecpt negative limits', async () => {
      const limit = -25;
      const offset = 1;

      const { status } = await request
        .get(`/lists?limit=${limit}&offset=${offset}`);

      expect(status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Visibility', () => {
    let listWithoutOwner: List;

    beforeEach(async () => {
      listWithoutOwner = await db
        .getRepository(List)
        .save(createList('List #9001', true, 'List without an owner'));
    });

    it('should not return invisible list', async () => {
      const { status, body } = await request.get('/lists');
      expect(status).toEqual(StatusCodes.OK);
      expect(body.objects).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ id: listWithoutOwner.id }),
        ]),
      );
    });

    it('should return not found when fetching invisible list', async () => {
      const { status } = await request.get(`/lists/${listWithoutOwner.id}`);
      expect(status).toEqual(StatusCodes.NOT_FOUND);
    });

    it('should return not found when trying to update invisible list', async () => {
      const { status } = await request.put(`/lists/${listWithoutOwner.id}`)
        .send({ name: 'New name' });
      expect(status).toEqual(StatusCodes.NOT_FOUND);
    });

    it('should return not found when trying to create item in invisible list', async () => {
      const { status } = await request.post(`/lists/${listWithoutOwner.id}/items`)
        .send({ name: 'New item' });
      expect(status).toEqual(StatusCodes.NOT_FOUND);
    });
  });

  afterEach(async () => {
    await clearDatabase(db);
  });

  afterAll(async () => {
    await db.close();
  });
});
