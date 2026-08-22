import { Service } from '@angular/core';
import Swal from 'sweetalert2';

@Service()
export class Utils {
  public bootstrapClasses = {
    popup: 'card',
    cancelButton: 'btn btn-danger',
    denyButton: 'btn btn-secondary',
    confirmButton: 'btn btn-primary',
  };

  public showDialog(text: string, callback: Function, confirm: string = 'Yes', cancel: string = 'No',) {
    Swal.fire({
      title: text,
      showCancelButton: true,
      confirmButtonText: confirm,
      cancelButtonText: cancel,
      customClass: this.bootstrapClasses,
      backdrop: `
        rgba(0,0,123,0.4)
        url("/nyan.gif")
        top
        no-repeat
      `,
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  }

  public showAlert(text:string){
    Swal.fire({
      icon: 'info',
      title: text,
      customClass: this.bootstrapClasses,
      backdrop: `
        rgba(0,0,123,0.4)
        url("/nyan.gif")
        top
        no-repeat
      `,
    });
  }
}
