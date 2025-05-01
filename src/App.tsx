import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
import { ItemForm, ItemFormFields } from "./ItemForm";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { SxProps } from '@mui/system';
// import { getUrl } from 'aws-amplify/storage';

const client = generateClient<Schema>();

const fabStyle = {
  position: 'absolute',
  top: 72,
  right: 16,
};
const fabSx = fabStyle as SxProps;

function App() {
  const [collections, setCollections] = useState<Array<Schema["Collection"]["type"]>>([]);
  // const [photoUrls, setPhotoUrls] = useState<(string | null)[]>([]);
  const [version, setVersion] = useState(0);
  const [addItemOpen, setAddItemOpen] = useState(false);

  const [checkboxesOpen, setCheckboxesOpen] = useState(false);

  console.log(checkboxesOpen);
  
  useEffect(() => {
    client.models.Collection.list().then(({ data }) => {
      if (data) {
        setCollections(data);
        // const urlPromises = data.map(collection => {
        //   return collection.photofile
        //   ? getUrl({path:collection.photofile})
        //   : null
        // });
        // Promise.all(urlPromises).then(urls => {
        //   setPhotoUrls(urls.map(url => url ? url.url.toString() : null))
        // })
      }
    });
  }, [version]);

  const { user:cognitoUser, signOut } = useAuthenticator();

  console.log(cognitoUser);

  function handleAddItemClose(data : ItemFormFields | null) {
    if (data) {
      if (data.name && data.filename) {
        client.models.Item.create({ name: data.name, photofile: data.filename, collectionId: cognitoUser.userId })
        .then(() => setVersion(version + 1));
        setAddItemOpen(false);
      } else {
        alert("You must supply a name and photo file")
      }
    } else {
      setAddItemOpen(false);
    }
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Collections
            </Typography>
            <Button color="inherit" onClick={() => setCheckboxesOpen(true)}>Checkboxes</Button>
            <Button color="inherit" onClick={signOut}>Logout</Button>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} sx={{m:2}}>
          {collections.map((collection) => {
            return (
              <Grid key={collection.id} size={{xs:2, sm:3, md:4, lg:5, xl:6}}>
                <Card>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {collection.title}
                    </Typography>
                  </CardContent>
                </Card>s
                
              </Grid>
            )
          })}
          
        </Grid>

      </Box>
      <ItemForm open={addItemOpen} handleClose={handleAddItemClose} userId={cognitoUser.userId}/>
      <Fab color="secondary" aria-label="add" sx={fabSx} onClick={() => setAddItemOpen(true)}>
        <AddIcon />
      </Fab>
    </>
  );
}

export default App;