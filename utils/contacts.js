const fs = require('node:fs');


const dataPath = './data/contacts.json';
const dirPath = './data';

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
  console.log('Data ditambah');
}
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8');
  console.log('Data ditambah');
}

const loadContact = () => {
  const fileBuffer = fs.readFileSync('data/contacts.json', 'utf-8');
  const contacts = JSON.parse(fileBuffer);
  return contacts;
};
const findContact = (nama) => {
  
  const contact = loadContact().find((c) => c.nama.toLowerCase() === nama.toLowerCase());
  return contact;
  
};

const addContact = (data) => {
  contact = loadContact();
  contact.push(data);
  fs.writeFileSync('data/contacts.json', JSON.stringify(contact));

  
  
};
const editContact = (data)=>{
  contact = loadContact();

  contact.forEach((c, i) => {
    if(c.nama == data.oldName){
      c.nama = data.nama;
      c.email = data.email;
      c.no_Hp = data.no_Hp;
    }
    
  });
  fs.writeFileSync('data/contacts.json', JSON.stringify(contact));


  

  
  


}
const deleteContact = (nama) => {
  const newContact = loadContact().filter((contact) => contact.nama!==nama);
  
  fs.writeFileSync('data/contacts.json', JSON.stringify(newContact));
  return newContact;
  
  
};
const checkDuplicate = (nama) => {

  
  const contacts = loadContact();
  
  const result = contacts.find((contact) => contact.nama === nama);

  return result;

};

module.exports = {
    loadContact,findContact,addContact,checkDuplicate,deleteContact,editContact
}