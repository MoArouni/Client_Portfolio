import React from 'react';
import { Helmet } from 'react-helmet';
import UserProfile from '../components/profile/UserProfile';

const ProfilePage = () => {
  return (
    <>
      <Helmet>
        <title>My Profile - Portfolio</title>
        <meta name="description" content="View and manage your appointments and profile information." />
      </Helmet>
      <UserProfile />
    </>
  );
};

export default ProfilePage; 