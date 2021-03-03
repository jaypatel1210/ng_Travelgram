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

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  picture = 'https://firebasestorage.googleapis.com/v0/b/angular-fire-learn.appspot.com/o/user.png?alt=media&token=9359bf9d-7499-4f8a-afd8-c880c233a507';

  uploadPercent: number = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(f: NgForm): any {
    const { uemail, password, username, ucountry, ubio, uname } = f.form.value;

    // further sanitization - do here
    this.auth.signUp(uemail, password)
      .then((res) => {
        console.log(res);
        const { uid } = res.user;

        this.db.object(`/users/${uid}`)
          .set({
            id: uid,
            name: uname,
            email: uemail,
            instaUserName: username,
            country: ucountry,
            bio: ubio,
            picture: this.picture,
          });
      })
      .then(() => {
        this.router.navigateByUrl('/');
        this.toastr.success('SignUp Success');
      })
      .catch((err) => {
        console.log(err);
        this.toastr.error('Signup failed');
      });
  }

  async uploadFile(event): Promise<any> {
    const file = event.target.files[0];

    const resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath = file.name; // rename the image with TODO: UUID
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percetage) => {
      this.uploadPercent = percetage;
    });

    task.snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('image upload success');
          });
        }),
      )
      .subscribe();
  }
}
