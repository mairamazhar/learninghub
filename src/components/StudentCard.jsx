import { getStatusLabel } from '../constants/status.js'
import './StudentCard.css'

// Builds "AK" from "Ayesha Khan"
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// Same name always gets the same avatar colour
function getAvatarHue(name) {
  let hash = 0
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

function getAttendanceLevel(value) {
  if (value >= 90) return 'good'
  if (value >= 75) return 'ok'
  return 'low'
}

/**
 * StudentCard: a presentational card. All data and behaviour come from props.
 *
 * @param {object}   props
 * @param {string}   props.name             Full name (required)
 * @param {string}   props.rollNo           Roll / registration number (required)
 * @param {string}   props.course           Enrolled course (required)
 * @param {string}   [props.email]          Contact email
 * @param {string}   [props.avatarUrl]      Photo URL; falls back to initials
 * @param {number}   [props.semester]       Current semester
 * @param {number}   [props.gpa]            GPA on a 4.0 scale
 * @param {number}   [props.attendance]     Attendance percentage (0-100)
 * @param {'active'|'graduated'|'probation'} [props.status]
 * @param {string[]} [props.skills]         Skill tags
 * @param {boolean}  [props.isFavorite]     Whether the card is starred
 * @param {Function} [props.onToggleFavorite] Called when the star is clicked
 * @param {Function} [props.onViewProfile]  Called when "View profile" is clicked
 */
function StudentCard({
  name,
  rollNo,
  course,
  email,
  avatarUrl,
  semester,
  gpa,
  attendance = 0,
  status = 'active',
  skills = [],
  isFavorite = false,
  onToggleFavorite,
  onViewProfile,
}) {
  const MAX_SKILLS = 3
  const visibleSkills = skills.slice(0, MAX_SKILLS)
  const hiddenCount = skills.length - visibleSkills.length
  const attendanceLevel = getAttendanceLevel(attendance)

  return (
    <article className="student-card" aria-label={`Student card for ${name}`}>
      <header className="student-card__header">
        {avatarUrl ? (
          <img className="student-card__avatar" src={avatarUrl} alt="" />
        ) : (
          <div
            className="student-card__avatar student-card__avatar--initials"
            style={{ '--hue': getAvatarHue(name) }}
            aria-hidden="true"
          >
            {getInitials(name)}
          </div>
        )}

        <div className="student-card__identity">
          <h3 className="student-card__name">{name}</h3>
          <p className="student-card__roll">{rollNo}</p>
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            className={`student-card__fav ${isFavorite ? 'is-active' : ''}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        )}
      </header>

      <div className="student-card__meta">
        <span className="student-card__course">{course}</span>
        <span className={`student-card__status student-card__status--${status}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      <dl className="student-card__stats">
        <div>
          <dt>Semester</dt>
          <dd>{semester ?? '—'}</dd>
        </div>
        <div>
          <dt>GPA</dt>
          <dd>{gpa != null ? gpa.toFixed(1) : '—'}</dd>
        </div>
        <div>
          <dt>Attendance</dt>
          <dd>{attendance}%</dd>
        </div>
      </dl>

      <div
        className={`student-card__progress student-card__progress--${attendanceLevel}`}
        role="progressbar"
        aria-label="Attendance"
        aria-valuenow={attendance}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${Math.min(Math.max(attendance, 0), 100)}%` }} />
      </div>

      {skills.length > 0 && (
        <ul className="student-card__skills" aria-label="Skills">
          {visibleSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
          {hiddenCount > 0 && (
            <li className="student-card__skills-more" title={skills.slice(MAX_SKILLS).join(', ')}>
              +{hiddenCount}
            </li>
          )}
        </ul>
      )}

      <footer className="student-card__actions">
        {email && (
          <a className="btn btn--ghost" href={`mailto:${email}`}>
            Email
          </a>
        )}
        {onViewProfile && (
          <button type="button" className="btn btn--primary" onClick={onViewProfile}>
            View profile
          </button>
        )}
      </footer>
    </article>
  )
}

export default StudentCard
