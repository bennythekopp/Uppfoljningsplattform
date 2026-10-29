export function planningPermissions(user:{role:string,email:string},settings:{editorEmails:string[],suggesterEmails:string[]}){
 const canEdit=user.role==='Administratör'||user.role==='Instruktör'&&settings.editorEmails.includes(user.email);
 return {canEdit,canSuggest:!canEdit&&['Instruktör','Chef'].includes(user.role)&&settings.suggesterEmails.includes(user.email)};
}
