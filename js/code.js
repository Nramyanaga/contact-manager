//const urlBase = 'http://ramyanaga.xyz/LAMPAPI';
const urlBase =
  location.hostname === 'localhost'
    ? 'http://localhost/contact-manager/LAMPAPI'
    : '/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "login.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "login.html";
}

function addContact()
{
	let firstName = document.getElementById("contactFirstName").value;
	let lastName = document.getElementById("contactLastName").value;
	let phone = document.getElementById("contactPhone").value;
	let email = document.getElementById("contactEmail").value;

	document.getElementById("contactAddResult").innerHTML = "";

	let tmp = {firstName:firstName, lastName:lastName, phone:phone, email:email, userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse(xhr.responseText);
                
                if (jsonObject.error && jsonObject.error !== "") 
                {
                    document.getElementById("contactAddResult").innerHTML = jsonObject.error;
                } 
                else 
                {
                    const resultEl = document.getElementById("contactAddResult");
                    resultEl.innerHTML = "Contact has been added";

                    // clear inputs
                    document.getElementById("contactFirstName").value = "";
                    document.getElementById("contactLastName").value = "";
                    document.getElementById("contactPhone").value = "";
                    document.getElementById("contactEmail").value = "";

                    // refresh list
                    searchContact();

                    // fade out message after 3 seconds
                    setTimeout(() => {
                        resultEl.innerHTML = "";
                    }, 3000);
                }
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
	
}

// function searchContact()
// {
//   let srch = document.getElementById("searchText").value;
//   const resultEl = document.getElementById("contactSearchResult");
//   resultEl.innerHTML = "";

//   let contactList = "";
//   let tmp = {search: srch, userId: userId};
//   let jsonPayload = JSON.stringify(tmp);

//   let url = urlBase + '/SearchContacts.' + extension;

//   let xhr = new XMLHttpRequest();
//   xhr.open("POST", url, true);
//   xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
//   try {
//     xhr.onreadystatechange = function() {
//       if (this.readyState == 4 && this.status == 200) {
//         let jsonObject = JSON.parse(xhr.responseText);

//         if (jsonObject.error && jsonObject.error !== "") {
//           // show "No records found" for 3 seconds
//           resultEl.innerHTML = jsonObject.error;
//           setTimeout(() => { resultEl.innerHTML = ""; }, 3000);
//         } else {
//           const contactListEl = document.getElementById("contactList");
//           contactListEl.innerHTML = ""; // Clear first
          
//           for (let i=0; i<jsonObject.results.length; i++) {
//             const contact = jsonObject.results[i];
            
//             // Create contact row
//             const rowDiv = document.createElement('div');
//             rowDiv.className = 'contact-row';
//             rowDiv.id = `contact-${contact.ID}`;

//             rowDiv.dataset.contactId = String(contact.ID);
            
//             // Create contact info section
//             const infoDiv = document.createElement('div');
//             infoDiv.className = 'contact-info';
            
//             // Display mode
//             const displayDiv = document.createElement('div');
//             displayDiv.className = 'contact-display';
//             displayDiv.id = `display-${contact.ID}`;
//             displayDiv.innerHTML = `
//               <span class="contact-name">${contact.FirstName} ${contact.LastName}</span>
//               ${contact.Phone ? '<span class="contact-detail">Phone: ' + contact.Phone + '</span>' : ''}
//               ${contact.Email ? '<span class="contact-detail">Email: ' + contact.Email + '</span>' : ''}
//             `;
            
//             // Edit mode
//             const editDiv = document.createElement('div');
//             editDiv.className = 'contact-edit';
//             editDiv.id = `edit-${contact.ID}`;
//             editDiv.style.display = 'none';
//             editDiv.innerHTML = `
//               <input type="text" id="editFirstName-${contact.ID}" value="${contact.FirstName}" placeholder="First Name" class="edit-input" />
//               <input type="text" id="editLastName-${contact.ID}" value="${contact.LastName}" placeholder="Last Name" class="edit-input" />
//               <input type="text" id="editPhone-${contact.ID}" value="${contact.Phone || ''}" placeholder="Phone" class="edit-input" />
//               <input type="text" id="editEmail-${contact.ID}" value="${contact.Email || ''}" placeholder="Email" class="edit-input" />
//             `;
            
//             infoDiv.appendChild(displayDiv);
//             infoDiv.appendChild(editDiv);
            
//             // Create actions section
//             const actionsDiv = document.createElement('div');
//             actionsDiv.className = 'contact-actions';
            
//             // Delete button
//             const deleteBtn = document.createElement('button');
//             deleteBtn.className = 'delete-inline';
//             deleteBtn.textContent = 'Delete';
//             deleteBtn.onclick = function() { deleteContact(contact.ID); };
            
//             // Update button
//             const updateBtn = document.createElement('button');
//             updateBtn.className = 'update-inline';
//             updateBtn.id = `updateBtn-${contact.ID}`;
//             updateBtn.textContent = 'Update';
//             updateBtn.onclick = function() { toggleEdit(contact.ID); };
            
//             // Confirm button
//             const confirmBtn = document.createElement('button');
//             confirmBtn.className = 'confirm-inline';
//             confirmBtn.id = `confirmBtn-${contact.ID}`;
//             confirmBtn.textContent = 'Confirm';
//             confirmBtn.style.display = 'none';
//             confirmBtn.onclick = function() { confirmUpdate(contact.ID); };
            
//             // Cancel button
//             const cancelBtn = document.createElement('button');
//             cancelBtn.className = 'cancel-inline';
//             cancelBtn.id = `cancelBtn-${contact.ID}`;
//             cancelBtn.textContent = 'Cancel';
//             cancelBtn.style.display = 'none';
//             cancelBtn.onclick = function() { cancelEdit(contact.ID); };
            
//             actionsDiv.appendChild(deleteBtn);
//             actionsDiv.appendChild(updateBtn);
//             actionsDiv.appendChild(confirmBtn);
//             actionsDiv.appendChild(cancelBtn);
            
//             // Assemble the row
//             rowDiv.appendChild(infoDiv);
//             rowDiv.appendChild(actionsDiv);
            
//             // Add to list
//             contactListEl.appendChild(rowDiv);
//           }
//         }
//       }
//     };
//     xhr.send(jsonPayload);
//   }
//   catch(err) {
//     resultEl.innerHTML = err.message;
//     setTimeout(() => { resultEl.innerHTML = ""; }, 3000);
//   }
// }

function searchContact() {
  const srchInput = document.getElementById("searchText");
  const srch = (srchInput?.value || "").trim();
  const resultEl = document.getElementById("contactSearchResult");
  const contactListEl = document.getElementById("contactList");

  // always clear the list before deciding what to render next
  contactListEl.innerHTML = "";
  // also clear any previous message; we'll set it conditionally below
  resultEl.innerHTML = "";

  const payload = JSON.stringify({ search: srch, userId });
  const url = urlBase + '/SearchContacts.' + extension;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      // Network/server error -> just show message; keep list cleared
      if (this.status !== 200) {
        resultEl.innerText = "Search failed. Please try again.";
        return;
      }

      let data = {};
      try { data = JSON.parse(xhr.responseText || "{}"); } catch {}

      const hasError = !!(data.error && data.error !== "");
      const results = Array.isArray(data.results) ? data.results : [];

      // If the box is non-empty and there are no matches => show "No records found"
      if (srch.length > 0 && (hasError || results.length === 0)) {
        resultEl.innerText = "No records found";
        // list stays empty
        return;
      }

      // If the box is empty and backend returned nothing (or error), just show nothing
      // (Some backends return all contacts for empty search; if yours does, this won't run.)
      if (srch.length === 0 && (hasError || results.length === 0)) {
        resultEl.innerText = "";
        // list stays empty; optionally you can bail here
        return;
      }

      // Otherwise, render the matches and clear any message
      resultEl.innerText = "";

      for (let i = 0; i < results.length; i++) {
        const c = results[i];

        const rowDiv = document.createElement('div');
        rowDiv.className = 'contact-row';
        rowDiv.id = `contact-${c.ID}`;
        rowDiv.dataset.contactId = String(c.ID);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'contact-info';

        const displayDiv = document.createElement('div');
        displayDiv.className = 'contact-display';
        displayDiv.id = `display-${c.ID}`;
        displayDiv.innerHTML = `
          <span class="contact-name">${c.FirstName} ${c.LastName}</span>
          ${c.Phone ? '<span class="contact-detail">Phone: ' + c.Phone + '</span>' : ''}
          ${c.Email ? '<span class="contact-detail">Email: ' + c.Email + '</span>' : ''}
        `;

        const editDiv = document.createElement('div');
        editDiv.className = 'contact-edit';
        editDiv.id = `edit-${c.ID}`;
        editDiv.style.display = 'none';
        editDiv.innerHTML = `
          <input type="text" id="editFirstName-${c.ID}" value="${c.FirstName}" placeholder="First Name" class="edit-input" />
          <input type="text" id="editLastName-${c.ID}" value="${c.LastName}" placeholder="Last Name" class="edit-input" />
          <input type="text" id="editPhone-${c.ID}" value="${c.Phone || ''}" placeholder="Phone" class="edit-input" />
          <input type="text" id="editEmail-${c.ID}" value="${c.Email || ''}" placeholder="Email" class="edit-input" />
        `;

        infoDiv.appendChild(displayDiv);
        infoDiv.appendChild(editDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'contact-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-inline';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function () { deleteContact(c.ID); };

        const updateBtn = document.createElement('button');
        updateBtn.className = 'update-inline';
        updateBtn.id = `updateBtn-${c.ID}`;
        updateBtn.textContent = 'Update';
        updateBtn.onclick = function () { toggleEdit(c.ID); };

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-inline';
        confirmBtn.id = `confirmBtn-${c.ID}`;
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.display = 'none';
        confirmBtn.onclick = function () { confirmUpdate(c.ID); };

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-inline';
        cancelBtn.id = `cancelBtn-${c.ID}`;
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.display = 'none';
        cancelBtn.onclick = function () { cancelEdit(c.ID); };

        actionsDiv.appendChild(deleteBtn);
        actionsDiv.appendChild(updateBtn);
        actionsDiv.appendChild(confirmBtn);
        actionsDiv.appendChild(cancelBtn);

        rowDiv.appendChild(infoDiv);
        rowDiv.appendChild(actionsDiv);
        contactListEl.appendChild(rowDiv);
      }
    }
  };

  xhr.send(payload);
}


function toggleEdit(contactId) {
  // Hide display, show edit fields
  document.getElementById(`display-${contactId}`).style.display = 'none';
  document.getElementById(`edit-${contactId}`).style.display = 'flex';
  
  // Hide update button, show confirm/cancel
  document.getElementById(`updateBtn-${contactId}`).style.display = 'none';
  document.getElementById(`confirmBtn-${contactId}`).style.display = 'inline-block';
  document.getElementById(`cancelBtn-${contactId}`).style.display = 'inline-block';
}

function cancelEdit(contactId) {
  // Show display, hide edit fields
  document.getElementById(`display-${contactId}`).style.display = 'flex';
  document.getElementById(`edit-${contactId}`).style.display = 'none';
  
  // Show update button, hide confirm/cancel
  document.getElementById(`updateBtn-${contactId}`).style.display = 'inline-block';
  document.getElementById(`confirmBtn-${contactId}`).style.display = 'none';
  document.getElementById(`cancelBtn-${contactId}`).style.display = 'none';
}

function confirmUpdate(contactId) {
  const firstName = document.getElementById(`editFirstName-${contactId}`).value.trim();
  const lastName = document.getElementById(`editLastName-${contactId}`).value.trim();
  const phone = document.getElementById(`editPhone-${contactId}`).value.trim();
  const email = document.getElementById(`editEmail-${contactId}`).value.trim();

  if (!firstName || !lastName) {
    showInlineError("contactSearchResult", "First and Last name are required");
    setTimeout(() => { showInlineError("contactSearchResult", ""); }, 3000);
    return;
  }

  if (!email) {
    showInlineError("contactSearchResult", "Email is required");
    setTimeout(() => { showInlineError("contactSearchResult", ""); }, 3000);
    return;
  }

  const tmp = {
    id: contactId,
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    email: email,
    userId: userId
  };

  const jsonPayload = JSON.stringify(tmp);
  const url = urlBase + '/UpdateContacts.' + extension;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const res = JSON.parse(xhr.responseText || "{}");

      if (res.error && res.error !== "") {
        showInlineError("contactSearchResult", res.error);
        setTimeout(() => { showInlineError("contactSearchResult", ""); }, 3000);
      } else {
        const resultEl = document.getElementById("contactSearchResult");
        resultEl.innerHTML = "Contact updated successfully";
        setTimeout(() => { resultEl.innerHTML = ""; }, 3000);
        
        // Refresh the contact list
        searchContact();
      }
    }
  };

  xhr.send(jsonPayload);
}

function deleteContact(contactIdFromSearch)
{
  // Coerce to number to match PHP intval behavior
  const contactId = Number(contactIdFromSearch || document.getElementById("deleteContactId")?.value);
  const resultEl = document.getElementById("contactDeleteResult");
  resultEl.innerHTML = "";

  // 🔥 Optimistic UI: remove the row immediately
  const node = document.getElementById(`contact-${contactId}`) 
            || document.querySelector(`[data-contact-id="${contactId}"]`);
  if (node) node.remove();

  // Some starter PHP expects "ID" (capitalized). Send both to be safe.
  const payload = { id: contactId, ID: contactId, userId: userId };
  const jsonPayload = JSON.stringify(payload);

  const url = urlBase + '/DeleteContact.' + extension;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status !== 200) {
        resultEl.innerHTML = "Delete failed (network/server). Re-syncing…";
        // If server failed, refresh to restore the true list
        searchContact();
        return;
      }

      let res = {};
      try { res = JSON.parse(xhr.responseText || "{}"); } catch {}

      if (res.error && res.error !== "") {
        resultEl.innerHTML = res.error;
        // Server refused delete — re-fetch to restore accurate list
        searchContact();
      } else {
        resultEl.innerHTML = "Contact has been deleted";
        setTimeout(() => { resultEl.innerHTML = ""; }, 3000);
      }
    }
  };

  xhr.send(jsonPayload);
}

function updateContact()
{
    let contactId = document.getElementById("updateContactId").value;
    let firstName = document.getElementById("updateFirstName").value;
    let lastName = document.getElementById("updateLastName").value;
    let phone = document.getElementById("updatePhone").value;
    let email = document.getElementById("updateEmail").value;
    
    document.getElementById("contactUpdateResult").innerHTML = "";

    let tmp = {id:contactId, firstName:firstName, lastName:lastName, phone:phone, email:email, userId:userId};
    let jsonPayload = JSON.stringify(tmp);
    
    let url = urlBase + '/UpdateContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                let jsonObject = JSON.parse(xhr.responseText);
                
                if (jsonObject.error && jsonObject.error !== "") 
                {
                    document.getElementById("contactUpdateResult").innerHTML = jsonObject.error;
                } 
                else 
                {
                    document.getElementById("contactUpdateResult").innerHTML = "Contact has been updated successfully";
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("contactUpdateResult").innerHTML = err.message;
    }
}

function showInlineError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerText = msg || "";
}

function validateSignupFields({ firstName, lastName, login, password, password2 }) {
  if (!firstName || !lastName || !login || !password || !password2) {
    return "Please fill in all fields.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (password !== password2) {
    return "Passwords do not match.";
  }
  return "";
}

function doSignup() {
  // grab values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const login     = document.getElementById("signupLogin").value.trim();
  let   password  = document.getElementById("signupPassword").value;
  const password2 = document.getElementById("signupPassword2").value;

  // validations
  const err = validateSignupFields({ firstName, lastName, login, password, password2 });
  if (err) {
    showInlineError("signupResult", err);
    return;
  }

  const payload = { firstName, lastName, login, password };

  const url = urlBase + '/SignUp.' + extension; // hits SignUp.php on your server
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  showInlineError("signupResult", "Creating your account...");

  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      // success
      if (this.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText || "{}");
          if (res.error) {
            showInlineError("signupResult", res.error);
            return;
          }
          showInlineError("signupResult", "");
          //window.location.href = "index.html";
          window.location.href = "login.html?signup=success";
        } catch (e) {
          showInlineError("signupResult", "Unexpected response. Please try again.");
        }
      } else {
        showInlineError("signupResult", "Signup failed. Please try again.");
      }
    }
  };

  xhr.onerror = function () {
    showInlineError("signupResult", "Network error. Please try again.");
  };

  xhr.send(JSON.stringify(payload));
}

