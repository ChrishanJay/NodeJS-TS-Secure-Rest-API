export interface PutUserDTO {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissionFlags: number;
}