import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FreeVideoAccessForm } from '@components/video/free-video-access-form';
import { videoService } from '@services/index';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { useState } from 'react';

export default function FreeVideoAccessPage() {
  const [submiting, setSubmiting] = useState(false);

  const handleSubmit = async (values) => {
    const { userId, hasFreeVideoAccess } = values;
    try {
      setSubmiting(true);
      await videoService.updateFreeVideoAccess(userId, { hasFreeVideoAccess });
      message.success('Free video access updated successfully');
      Router.push('/free-access-video');
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(err.message || 'Something went wrong, please try again!');
    } finally {
      setSubmiting(false);
    }
  };

  return (
    <>
      <Head>
        <title>New Free User Free Video Access</title>
      </Head>
      <BreadcrumbComponent
        breadcrumbs={[
          { title: 'Free Access Video', href: '/free-access-video' },
          { title: 'New Free User Free Video Access' }
        ]}
      />
      <Page>
        <FreeVideoAccessForm
          onFinish={handleSubmit}
          submiting={submiting}
        />
      </Page>
    </>
  );
}
