import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  loading = false;
  actionLoadingId: number | null = null;
  err = '';
  success = '';

  users: any[] = [];
  filtered: any[] = [];

  q = '';
  statusFilter = 'ALL';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.err = '';
    this.success = '';

    this.adminService.getAllUsers().subscribe({
      next: (res: any[]) => {
        this.users = Array.isArray(res) ? res : [];
        this.applyFilter();
        this.loading = false;
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const search = (this.q || '').trim().toLowerCase();

    this.filtered = this.users.filter((u: any) => {
      const name = String(u?.name || '').toLowerCase();
      const email = String(u?.email || '').toLowerCase();
      const role = String(u?.role?.roleName || '').toLowerCase();
      const status = String(u?.status || '').toUpperCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        role.includes(search);

      const matchesStatus =
        this.statusFilter === 'ALL' || status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  block(id: number): void {
    if (!id || this.actionLoadingId) return;
    if (!confirm('Block this user?')) return;

    this.actionLoadingId = id;
    this.err = '';
    this.success = '';

    this.adminService.blockUser(id).subscribe({
      next: () => {
        this.success = 'User blocked successfully';
        this.actionLoadingId = null;
        this.load();
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to block user';
        this.actionLoadingId = null;
      }
    });
  }

  unblock(id: number): void {
    if (!id || this.actionLoadingId) return;
    if (!confirm('Unblock this user?')) return;

    this.actionLoadingId = id;
    this.err = '';
    this.success = '';

    this.adminService.unblockUser(id).subscribe({
      next: () => {
        this.success = 'User unblocked successfully';
        this.actionLoadingId = null;
        this.load();
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to unblock user';
        this.actionLoadingId = null;
      }
    });
  }

  badgeClass(status: string): string {
    const s = (status || '').toUpperCase();

    if (s === 'ACTIVE') return 'bg-green-50 text-green-800 border-green-200';
    if (s === 'BLOCKED' || s === 'INACTIVE') return 'bg-red-50 text-red-800 border-red-200';

    return 'bg-gray-50 text-gray-800 border-gray-200';
  }

  roleText(role: any): string {
    return String(role?.roleName || role || '-');
  }
}