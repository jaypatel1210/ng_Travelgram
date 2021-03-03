import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
// services
import { AuthService } from 'src/app/services/auth.service';

// angular form
import { NgForm } from '@angular/forms';

import { finalize } from 'rxjs/operators';
// firebase
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';

// browser image resizer
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from 'src/utils/config';

// uuid
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css'],
})
export class AddpostComponent implements OnInit {
  locationName: string;
  description: string;
  picture: string = null;

  user = null;
  uploadPercent: number = null;

  constructor(
    private db: AngularFireDatabase,
    private strorage: AngularFireStorage,
    private toastr: ToastrService,
    auth: AuthService,
    private router: Router,
  ) {
    console.log('add post section');
    auth.getUser().subscribe((users) => {
      this.db.object(`/users/${users.uid}`)
        .valueChanges()
        .subscribe((user) => {
          this.user = user;
        });
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): any {
    console.log('on submit click ad post');

    const uid = uuidv4();

    this.db.object(`/posts/${uid}`)
      .set({
        id: uid,
        locationName: this.locationName,
        description: this.description,
        picture: this.picture,
        by: this.user.name,
        instaId: this.user.instaUserName,
        date: Date.now(),
      })
      .then(() => {
        this.toastr.success('Post added successfully');
        this.router.navigateByUrl('/');
      })
      .catch((err) => {
        this.toastr.error('Oopsss');
      });
  }

  async uploadFile(event): Promise<any> {
    const file = event.target.files[0];

    const resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath = file.name;
    const fileRef = this.strorage.ref(filePath);

    const task = this.strorage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          this.picture = url;
          this.toastr.success('Image upload Success');
        });
      }),
    ).subscribe();
  }
}
