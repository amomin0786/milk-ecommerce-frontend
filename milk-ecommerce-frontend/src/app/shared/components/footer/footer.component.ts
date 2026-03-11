import { Component } from '@angular/core';
import { NewsletterService } from 'src/app/core/services/newsletter.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent {

  email = '';
  msg = '';

  constructor(private newsletterService: NewsletterService) {}

  subscribe(e: Event) {

    e.preventDefault();

    if (!this.email) {
      this.msg = "Enter email";
      return;
    }

    this.newsletterService.subscribe(this.email).subscribe({

      next: (res: any) => {
        this.msg = res?.message || "Subscribed successfully";
        this.email = '';
      },

      error: () => {
        this.msg = "Subscription failed";
      }

    });

  }

}