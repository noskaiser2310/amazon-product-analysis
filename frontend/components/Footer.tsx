
import React from 'react';
import { RobotIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-slate-400 mt-12 py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center space-x-2">
            <RobotIcon className="h-5 w-5"/>
            <p>Group 7</p>
        </div>
        <p className="text-sm mt-1">Reimagining the Amazon Product Analysis Project</p>
      </div>
    </footer>
  );
};

export default Footer;
