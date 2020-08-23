import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, Button, Row, Col, Input } from 'antd';
import shortId from 'shortid';

import './index.css';

const Home = () => {
  const [url, setUrl] = useState('');
  const history = useHistory();

  const handleURLChange = (e) => setUrl(e.target.value);

  const joinMeeting = () => {
    const meetingURL = url ? url : shortId.generate();
    history.push(`/${meetingURL}`);
  };

  return (
    <div className="home">
      <h2>GoTools Meetings</h2>
      <Card className="meeting-card" size="small" title="Start or Join a meeting">
        <Button type="primary" onClick={joinMeeting}>
          Start instant meeting
        </Button>
        <div className="meeting-options">
          <Input type="text" onChange={handleURLChange} />
          <Button type="link" onClick={joinMeeting}>
            Join Meeting
          </Button>
        </div>
      </Card>
    </div>
  );
};
export default Home;
