document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // To toggle submit_email function after submit button is clicked
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Add this to not display the email details
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

// To view the message after the email is clicked 
function view_box_email(id){
  // Get request for emails
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
   
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-detail-view').style.display = 'block';
   
  
    document.querySelector('#email-detail-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From: </strong> <span>${email['sender']}</span></li>
        <li class="list-group-item"><strong>To: </strong><span>${email['recipients']}</span></li>
        <li class="list-group-item"><strong>Subject: </strong> <span>${email['subject']}</span</li>
        <li class="list-group-item"><strong>Time: </strong> <span>${email['timestamp']}</span></li>
        <li class="list-group-item">${email['body']}</li>
      </ul>
    `;

    // After the email is clicked mark is as read by using fetch
    if (!email['read']) {
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ read : true })
      })
    }

    // To allow the user to reply on the email
    const btn_reply = document.createElement('button');
    btn_reply.className = "btn btn-primary m-2";
    btn_reply.innerHTML = "Reply";
    btn_reply.addEventListener('click', function() {
      compose_email();

      document.querySelector('#compose-recipients').value = email['recipients'];
      let subject = email['subject'];
      // For adding the Re: for the reply mailbox if not present if present ignoring it
      if (subject.split(" ", 1)[0] != "Re:") {
        email.subject = "Re: " + email.subject;
      }
      document.querySelector('#compose-subject').value = email.subject;

      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

    });

    document.querySelector('#email-detail-view').appendChild(btn_reply);

    // The archive and unarchive functionality
    archivebtn = document.createElement('button');
    archivebtn.innerHTML = email['archived'] ? 'Unarchive' : 'Archive';
    archivebtn.className = email['archived'] ? 'btn btn-danger' : 'btn btn-success';
    archivebtn.addEventListener('click', function() {
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ archived : !email['archived'] })
      })
      .then(response => load_mailbox('archive'))
    });
    document.querySelector('#email-detail-view').appendChild(archivebtn);
  })
  // To catch any error if any
  .catch(error => {
    console.log('Error:', error);
  });
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Using get request to get emails for mailbox and user
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      // Loop through all the emails in that mailbox
      emails.forEach(singleEmail => {


        let newEmail = document.createElement('div');

        // Check if it is read or not
        if(singleEmail.read){
          newEmail.style.backgroundColor = "#cdcdcd";
        }
        else{
          newEmail.style.backgroundColor = "white";
        }
        
        
        // Displaying the sender , subject and timestamp on the mailbox when it pops up
        newEmail.innerHTML = `
          <span   style="margin: 0 10px" class="send_email"> <strong>${singleEmail['sender']}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          
          <span   style="margin: 0 30px" class="subject_email"> ${singleEmail['subject']}</span>
          
          <span   style="margin: 0 100px" class="timestamp_email"> ${singleEmail['timestamp']} </span>
        `

        newEmail.addEventListener('click', () => view_box_email(singleEmail['id']));
        document.querySelector('#emails-view').appendChild(newEmail);
      });

  })
  // To catch any error by printing on console
  .catch(error => {
    console.log('Error:', error);
  });

}


function submit_email(e){
  e.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  })
  // Catch any errors and print it on console
  .catch(error => {
    console.log('Error:', error);
  });
// After the mail is sent to redirect to the sentbox
  load_mailbox('sent');
  return true;
}