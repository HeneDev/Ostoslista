import { getRepository } from 'typeorm';
import { List, ListPermission, User } from '../entity';
import { UserRight } from '../model';

type PermissionName = 'READ';

interface MappedPermission {
  right: PermissionName;
  allowed: UserRight[];
}

export class PermissionService {
  private readonly repository = getRepository(ListPermission);

  // User rights are mapped here to actual things which they can do.
  private readonly PERMISSIONS: MappedPermission[] = [
    {
      right: 'READ',
      allowed: [
        UserRight.OWNER,
      ],
    },
  ];

  /**
   * Get allowed user rights which have given `permission`
   */
  getAllowedUserRights(permission: PermissionName) {
    return this.PERMISSIONS.find((p) => p.right === permission)?.allowed ?? [];
  }

  /**
   * Set `userRight` for the `user` to the `list` given.
   * @param list List entity
   * @param user User entity
   * @param userRight Name of the user right.
   */
  setPermission(list: List, user: User, userRight: UserRight) {
    const permission = new ListPermission();
    permission.list = list;
    permission.user = user;
    permission.userRight = userRight;
    return this.repository.save(permission);
  }
}
