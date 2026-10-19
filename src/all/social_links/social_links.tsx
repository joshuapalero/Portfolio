import { Link } from '@tanstack/react-router';
import { Mail, ThumbsUp } from 'lucide-react';
import { LiveViewerInline, LikeButton } from '../live_viewers';
import { DEFAULT_CONTACT_EMAIL, copyToClipboard } from '../navigation/contactConfig';

const linkedinIcon = '/linkedin.png';
const facebookIcon = '/facebook.png';
const instagramIcon = '/instagram.png';

export default function SocialLinks() {
  const handleEmailClick = async () => {
    await copyToClipboard(DEFAULT_CONTACT_EMAIL);
  };

  return (
    <div className="contact-info">
      <a
        href={`mailto:${DEFAULT_CONTACT_EMAIL}`}
        className="contact-link"
        onClick={handleEmailClick}
        title="Email Joshua (opens mail & copies address)"
      >
        <Mail size={16} />
        <span>Email</span>
      </a>

      <a href="https://www.facebook.com/profile.php?id=61593929556688" target="_blank" rel="noreferrer" className="contact-link">
        <img src={facebookIcon} alt="Facebook" className="social-icon" />
        <span>Facebook</span>
      </a>

      <a href="https://instagram.com" target="_blank" rel="noreferrer" className="contact-link">
        <img src={instagramIcon} alt="Instagram" className="social-icon" />
        <span>Instagram</span>
      </a>

      <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="contact-link">
        <img src={linkedinIcon} alt="LinkedIn" className="social-icon" />
        <span>LinkedIn</span>
      </a>

      <Link to="/recommendations" className="contact-link">
        <ThumbsUp size={16} />
        <span>Recommendations</span>
      </Link>

      <LiveViewerInline />

      <LikeButton sectionId="profile" />
    </div>
  );
}


