export function planningPermissions(user:{role:string,email:string},settings:{editorEmails:string[],suggesterEmails:string[]}){
 const canEdit=['Administratör','Instruktör'].includes(user.role)&&settings.editorEmails.includes(user.email);
 return {canEdit,canSuggest:canEdit||['Administratör','Instruktör','Chef'].includes(user.role)&&settings.suggesterEmails.includes(user.email)};
}
