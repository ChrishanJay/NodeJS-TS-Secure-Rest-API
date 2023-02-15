export enum PermissionFlag {
    PUBLIC = 1,
    REGISTERED_USER = 2, // Not yet approved
    APPROVED_MEMBER = 4, // not yet subscribed
    MEMBER = 8, // subscribed to monthly fee 199
    GOLD_MEMBER = 16, // subscribed to monthly fee 499
    FULL_MEMBER = 32, // subscribed to monthly fee 999
    PRIVILADGE_MEMBER = 64, //Donors
    MODERATOR = 128, // Maintenance Staff
    SUPERVISOR = 256, // Supervisors
    OFFICER = 512, // Office Bearers
    IT_ADMIN = 1024, // Admins
    LEADERSHIP = 2048, // Executives
    SUPER_ADMIN = 4096, // Sudo Admin
}